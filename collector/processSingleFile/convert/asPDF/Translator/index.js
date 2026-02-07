/**
 * Translates text content to English using Azure AI Translation.
 * Port of the Python EngineTranslator class.
 *
 * Azure Translator limits: max 100 elements per request, using 50 to be safe.
 */
class Translator {
  static BATCH_SIZE = 50;

  static log(text, ...args) {
    console.log(`\x1b[36m[Translator]\x1b[0m ${text}`, ...args);
  }

  /**
   * Translates an array of texts to English.
   * @param {string|string[]} texts - Text(s) to translate.
   * @param {string} translatorKey - Azure Translator API key.
   * @param {string} translatorEndpoint - Azure Translator endpoint.
   * @param {string} [translatorRegion] - Azure Translator region (optional for custom endpoints).
   * @returns {Promise<string[]>} Array of translated text strings.
   */
  static async translate(
    texts,
    translatorKey,
    translatorEndpoint,
    translatorRegion
  ) {
    try {
      if (typeof texts === "string") texts = [texts];
      if (!texts || texts.length === 0) return [];

      const {
        default: TextTranslationClient,
        isUnexpected,
      } = await import("@azure-rest/ai-translation-text");

      const credential = { key: translatorKey };
      // When using a custom endpoint, region is added if provided
      if (translatorRegion) {
        credential.region = translatorRegion;
      }
      const client = TextTranslationClient(translatorEndpoint, credential);

      this.log(`Translating ${texts.length} text elements to English`);

      /**
       * Translates a single batch of texts.
       * @param {string[]} batch
       * @returns {Promise<string[]>}
       */
      const translateBatch = async (batch) => {
        const inputText = batch.map((text) => ({ text }));
        const response = await client.path("/translate").post({
          body: inputText,
          queryParameters: { to: "en" },
        });

        if (isUnexpected(response)) {
          throw new Error(
            `Translation API error: ${JSON.stringify(response.body)}`
          );
        }

        return response.body.map((item) => item.translations[0].text);
      };

      // If texts array is small enough, process in one batch
      if (texts.length <= this.BATCH_SIZE) {
        const translated = await translateBatch(texts);
        this.log(`Translated ${texts.length} text elements to English`);
        return translated;
      }

      // Process in batches for large arrays
      const allTranslated = [];
      const totalBatches = Math.ceil(texts.length / this.BATCH_SIZE);

      for (let i = 0; i < texts.length; i += this.BATCH_SIZE) {
        const batch = texts.slice(i, i + this.BATCH_SIZE);
        const batchNum = Math.floor(i / this.BATCH_SIZE) + 1;
        this.log(
          `Translating batch ${batchNum}/${totalBatches} (${batch.length} elements)`
        );

        try {
          const translated = await translateBatch(batch);
          allTranslated.push(...translated);
        } catch (e) {
          this.log(`Translation failed for batch ${batchNum}: ${e.message}`);
          // Return original batch as fallback
          allTranslated.push(...batch);
        }
      }

      this.log(
        `Successfully translated all ${texts.length} text elements to English`
      );
      return allTranslated;
    } catch (e) {
      this.log(`Error translating text elements: ${e.message}`);
      return Array.isArray(texts) ? texts : [texts];
    }
  }
}

module.exports = Translator;
