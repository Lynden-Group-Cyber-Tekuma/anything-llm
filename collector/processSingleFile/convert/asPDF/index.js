const { v4 } = require("uuid");
const {
  createdDate,
  trashFile,
  writeToServerDocuments,
} = require("../../../utils/files");
const { tokenizeString } = require("../../../utils/tokenizer");
const { default: slugify } = require("slugify");
const PDFLoader = require("./PDFLoader");
const LanguageDetector = require("./LanguageDetector");
const Translator = require("./Translator");

async function asPdf({
  fullFilePath = "",
  filename = "",
  options = {},
  metadata = {},
}) {
  const pdfLoader = new PDFLoader(fullFilePath, {
    splitPages: true,
  });

  console.log(`-- Working ${filename} --`);
  const pageContent = [];
  const docs = await pdfLoader.load();

  for (const doc of docs) {
    console.log(
      `-- Parsing content from pg ${
        doc.metadata?.loc?.pageNumber || "unknown"
      } --`
    );
    if (!doc.pageContent || !doc.pageContent.length) continue;
    pageContent.push(doc.pageContent);
  }

  if (!pageContent.length) {
    console.error(`[asPDF] Resulting text content was empty for ${filename}.`);
    trashFile(fullFilePath);
    return {
      success: false,
      reason: `No text content found in ${filename}.`,
      documents: [],
    };
  }

  // Step 1: Detect language and translate if not predominantly English
  let translationSection = "";
  const languageEndpoint = process.env.AZURE_LANGUAGE_ENDPOINT;
  const languageKey = process.env.AZURE_LANGUAGE_KEY;
  const translatorEndpoint = process.env.AZURE_TRANSLATOR_ENDPOINT;
  const translatorKey = process.env.AZURE_TRANSLATOR_KEY;
  const translatorRegion = process.env.AZURE_TRANSLATOR_REGION;

  const hasLanguageConfig = languageEndpoint && languageKey;
  const hasTranslatorConfig = translatorEndpoint && translatorKey;

  if (hasLanguageConfig && hasTranslatorConfig) {
    const detectedLangs = await LanguageDetector.detectLanguage(
      pageContent,
      languageKey,
      languageEndpoint
    );

    const totalLangs = detectedLangs.length;
    const unknownLangs = detectedLangs.filter(
      (lang) => lang === "(Unknown)"
    ).length;
    const englishLangs = detectedLangs.filter(
      (lang) => lang === "English"
    ).length;

    // Check if English is not dominant
    const nonUnknownLangs = totalLangs - unknownLangs;
    if (
      totalLangs === unknownLangs ||
      englishLangs / nonUnknownLangs < 0.9
    ) {
      console.log("[asPDF] English is not dominant, translating...");
      const translatedContent = await Translator.translate(
        pageContent,
        translatorKey,
        translatorEndpoint,
        translatorRegion
      );

      // Only append translation section if translation actually produced different content
      const translatedText = translatedContent.join("");
      const originalText = pageContent.join("");
      if (translatedText && translatedText !== originalText) {
        translationSection =
          "\n\n---\n\n## English Translation\n\n" + translatedText;
        console.log("[asPDF] English translation section appended.");
      }
    }
  }

  const content = pageContent.join("") + translationSection;
  const data = {
    id: v4(),
    url: "file://" + fullFilePath,
    title: metadata.title || filename,
    docAuthor: metadata.docAuthor || "no author found",
    description: metadata.description || "No description found.",
    docSource: metadata.docSource || "pdf file uploaded by the user.",
    chunkSource: metadata.chunkSource || "",
    published: createdDate(fullFilePath),
    wordCount: content.split(" ").length,
    pageContent: content,
    token_count_estimate: tokenizeString(content),
  };

  const document = writeToServerDocuments({
    data,
    filename: `${slugify(filename)}-${data.id}`,
    options: { parseOnly: options.parseOnly },
  });
  trashFile(fullFilePath);
  console.log(`[SUCCESS]: ${filename} converted & ready for embedding.\n`);
  return { success: true, reason: null, documents: [document] };
}

module.exports = asPdf;
