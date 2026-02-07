/**
 * Detects the language of text content using Azure AI Text Analytics.
 * Port of the Python EngineDetectLang class.
 */
class LanguageDetector {
  static log(text, ...args) {
    console.log(`\x1b[36m[LanguageDetector]\x1b[0m ${text}`, ...args);
  }

  /**
   * Detects the language of the given texts.
   * @param {string[]} texts - Array of text strings to detect language for.
   * @param {string} languageKey - Azure Language service API key.
   * @param {string} languageEndpoint - Azure Language service endpoint.
   * @returns {Promise<string[]>} Array of detected language names (e.g. "English", "French", "(Unknown)").
   */
  static async detectLanguage(texts, languageKey, languageEndpoint) {
    try {
      const {
        TextAnalyticsClient,
        AzureKeyCredential,
      } = require("@azure/ai-text-analytics");

      const client = new TextAnalyticsClient(
        languageEndpoint,
        new AzureKeyCredential(languageKey)
      );

      this.log(`Detecting language for ${texts.length} texts`);
      const results = await client.detectLanguage(texts, "none");
      this.log("Language detection completed successfully");

      return results.map((result) => {
        if (result.error === undefined) {
          return result.primaryLanguage.name;
        }
        return "(Unknown)";
      });
    } catch (e) {
      this.log(`Error detecting language: ${e.message}`);
      return texts.map(() => "(Unknown)");
    }
  }
}

module.exports = LanguageDetector;
