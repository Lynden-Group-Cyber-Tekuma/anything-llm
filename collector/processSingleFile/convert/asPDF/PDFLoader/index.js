const fs = require("fs").promises;

class PDFLoader {
  constructor(filePath, { splitPages = true } = {}) {
    this.filePath = filePath;
    this.splitPages = splitPages;
  }

  log(text, ...args) {
    console.log(`\x1b[36m[PDFLoader]\x1b[0m ${text}`, ...args);
  }

  async load() {
    const endpoint = process.env.AZURE_OCR_ENDPOINT;
    const apiKey = process.env.AZURE_OCR_KEY;

    if (!endpoint || !apiKey) {
      throw new Error(
        "Azure Document Intelligence credentials are not configured. " +
          "Set AZURE_OCR_ENDPOINT and AZURE_OCR_KEY environment variables."
      );
    }

    const {
      default: DocumentIntelligence,
      getLongRunningPoller,
      isUnexpected,
    } = await import("@azure-rest/ai-document-intelligence");

    const client = DocumentIntelligence(endpoint, { key: apiKey });
    const base64Source = await fs.readFile(this.filePath, {
      encoding: "base64",
    });

    this.log("Analyzing document with Azure Document Intelligence...");
    const initialResponse = await client
      .path("/documentModels/{modelId}:analyze", "prebuilt-layout")
      .post({
        contentType: "application/json",
        body: { base64Source },
        queryParameters: {
          features: ["styleFont"],
          outputContentFormat: "markdown",
        },
      });

    if (isUnexpected(initialResponse)) {
      this.log(
        "Azure Document Intelligence error:",
        initialResponse.body.error
      );
      return [];
    }

    const poller = getLongRunningPoller(client, initialResponse);
    const result = await poller.pollUntilDone();
    const analyzeResult = result.body.analyzeResult;

    if (!analyzeResult) {
      this.log("No analyze result returned.");
      return [];
    }

    // Check for handwritten content
    if (analyzeResult.styles?.some((style) => style.isHandwritten)) {
      this.log("Document contains handwritten content");
    } else {
      this.log("Document does not contain handwritten content");
    }

    this.log("Document analyzed successfully");

    const documents = [];
    const fullContent = analyzeResult.content || "";
    const totalPages = analyzeResult.pages?.length || 1;

    if (this.splitPages && analyzeResult.pages) {
      for (const page of analyzeResult.pages) {
        let pageContent = "";
        if (page.spans && page.spans.length > 0) {
          for (const span of page.spans) {
            pageContent += fullContent.substring(
              span.offset,
              span.offset + span.length
            );
          }
        }

        documents.push({
          pageContent: pageContent.trim(),
          metadata: {
            source: this.filePath,
            pdf: {
              info: {},
              totalPages,
            },
            loc: { pageNumber: page.pageNumber },
          },
        });
      }
    } else {
      documents.push({
        pageContent: fullContent.trim(),
        metadata: {
          source: this.filePath,
          pdf: {
            info: {},
            totalPages,
          },
        },
      });
    }

    return documents;
  }
}

module.exports = PDFLoader;
