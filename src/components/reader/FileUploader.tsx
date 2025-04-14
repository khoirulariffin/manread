/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { FileText, Book, Image } from "lucide-react";
import * as PDFJS from "pdfjs-dist";
import * as Tesseract from "tesseract.js";
import { Book as EPub } from "epubjs";

interface FileUploaderProps {
  onTextExtracted: (text: string, fileType: string) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onTextExtracted }) => {
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  useEffect(() => {
    const setupPdfWorker = async () => {
      const pdfjsWorker = await import("pdfjs-dist/build/pdf.worker.entry");
      PDFJS.GlobalWorkerOptions.workerSrc = pdfjsWorker;
    };
    setupPdfWorker();
  }, []);

  // Extract text from PDF file
  const extractPdfText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await PDFJS.getDocument({ data: arrayBuffer }).promise;
      let extractedText = "";

      // Extract text from each page
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ");
        extractedText += pageText + " ";
      }

      return extractedText;
    } catch (error) {
      console.error("Error extracting PDF text:", error);
      toast({
        title: "Error processing PDF",
        description: "Could not extract text from the PDF file.",
        variant: "destructive",
      });
      return "";
    }
  };

  // Extract text from EPUB file
  const extractEpubText = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const book = new EPub();
      await book.open(arrayBuffer);

      let extractedText = "";

      // Process spine items (chapters/sections)
      const spine = book.spine;
      if (spine) {
        // Use the spine object carefully
        // Access the navigation items using any type to avoid TypeScript errors
        const spineItems = (spine as any).items || [];

        for (const item of spineItems) {
          try {
            if (item && item.href) {
              const content = await book.load(item.href);

              if (typeof content === "string") {
                // If content is a string, use it directly
                extractedText += content + " ";
              } else if (content) {
                // Extract text from content object
                // Handle different object structures
                let text = "";

                if (typeof (content as any).textContent === "string") {
                  text = (content as any).textContent;
                } else if (
                  typeof (content as any).body?.textContent === "string"
                ) {
                  text = (content as any).body.textContent;
                } else if (
                  typeof (content as any).documentElement?.textContent ===
                  "string"
                ) {
                  text = (content as any).documentElement.textContent;
                }

                extractedText += text + " ";
              }
            }
          } catch (itemError) {
            console.error("Error processing EPUB section:", itemError);
            // Continue to next section instead of failing entire book
          }
        }
      }

      return extractedText;
    } catch (error) {
      console.error("Error extracting EPUB text:", error);
      toast({
        title: "Error processing EPUB",
        description: "Could not extract text from the EPUB file.",
        variant: "destructive",
      });
      return "";
    }
  };

  // Extract text from image using OCR
  const extractImageText = async (file: File): Promise<string> => {
    try {
      const { data } = await Tesseract.recognize(file, "eng", {
        logger: (info: any) => {
          if (info.status === "recognizing text") {
            // Optional: Update progress if needed
          }
        },
      });

      return data.text || "";
    } catch (error) {
      console.error("Error extracting image text:", error);
      toast({
        title: "Error processing image",
        description: "Could not extract text from the image file.",
        variant: "destructive",
      });
      return "";
    }
  };

  // Handle file upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    let extractedText = "";
    let fileType = "";

    try {
      // Determine file type and extract text accordingly
      if (file.type === "application/pdf") {
        fileType = "pdf";
        toast({
          title: "Processing PDF",
          description: "Extracting text from PDF...",
        });
        extractedText = await extractPdfText(file);
      } else if (
        file.type === "application/epub+zip" ||
        file.name.endsWith(".epub")
      ) {
        fileType = "epub";
        toast({
          title: "Processing EPUB",
          description: "Extracting text from EPUB...",
        });
        extractedText = await extractEpubText(file);
      } else if (file.type.startsWith("image/")) {
        fileType = "image";
        toast({
          title: "Processing Image",
          description: "Performing OCR on image...",
        });
        extractedText = await extractImageText(file);
      } else if (file.type === "text/plain") {
        fileType = "text";
        const reader = new FileReader();
        extractedText = await new Promise((resolve) => {
          reader.onload = (event) => {
            resolve((event.target?.result as string) || "");
          };
          reader.readAsText(file);
        });
      } else {
        toast({
          title: "Unsupported file format",
          description: "Please upload a PDF, EPUB, image, or text file.",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      if (extractedText) {
        onTextExtracted(extractedText, fileType);
        toast({
          title: "File processed successfully",
          description: `${file.name} has been loaded.`,
        });
      } else {
        toast({
          title: "Empty content",
          description: "No text could be extracted from the file.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast({
        title: "Error processing file",
        description: "An error occurred while processing the file.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <Label htmlFor="file" className="mb-2 block">
        Upload File (PDF, EPUB, Image, or Text)
      </Label>
      <div className="flex items-center gap-2 flex-wrap">
        <Input
          id="file"
          type="file"
          accept=".pdf,.epub,.txt,image/*"
          onChange={handleFileUpload}
          className="cursor-pointer"
          disabled={isProcessing}
        />
        {isProcessing && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            <span>Processing...</span>
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <FileText size={14} /> PDF
        </div>
        <div className="flex items-center gap-1">
          <Book size={14} /> EPUB
        </div>
        <div className="flex items-center gap-1">
          <Image size={14} /> Image
        </div>
        <div className="flex items-center gap-1">
          <FileText size={14} /> Text
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
