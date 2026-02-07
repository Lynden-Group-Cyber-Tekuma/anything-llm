/**
 * @typedef MetaTagDefinition
 * @property {('link'|'meta')} tag - the type of meta tag element
 * @property {{string:string}|null} props - the inner key/values of a meta tag
 * @property {string|null} content - Text content to be injected between tags. If null self-closing.
 */

/**
 * Fixed browser appearance — edit these to change the tab title and favicon.
 * Used for server-rendered index.html and manifest.json.
 */
const FIXED_PAGE_TITLE = "AnythingLLM | Your personal LLM trained on anything";
const FIXED_FAVICON_URL = "/favicon.png";

/**
 * This class serves the default index.html page that is not present when built in production.
 * and therefore this class should not be called when in development mode since it is unused.
 * All this class does is basically emulate SSR for the meta-tag generation of the root index page.
 * Since we are an SPA, we can just render the primary page and the known entrypoints for the index.{js,css}
 * we can always start at the right place and dynamically load in lazy-loaded as we typically normally would
 * and we dont have any of the overhead that would normally come with having the rewrite the whole app in next or something.
 * Lastly, this class is singleton, so once instantiate the same reference is shared for as long as the server is alive.
 * the main function is `.generate()` which will return the index HTML. These settings are stored in the #customConfig
 * static property and will not be reloaded until the page is loaded AND #customConfig is explicitly null. So anytime a setting
 * for meta-props is updated you should get this singleton class and call `.clearConfig` so the next page load will show the new props.
 */
class MetaGenerator {
  name = "MetaGenerator";

  /** @type {MetaGenerator|null} */
  static _instance = null;

  /** @type {MetaTagDefinition[]|null} */
  #customConfig = null;

  #defaultManifest = {
    name: FIXED_PAGE_TITLE.split(" | ")[0],
    short_name: FIXED_PAGE_TITLE.split(" | ")[0],
    display: "standalone",
    orientation: "portrait",
    start_url: "/",
    icons: [
      {
        src: FIXED_FAVICON_URL,
        sizes: "any",
      },
    ],
  };

  constructor() {
    if (MetaGenerator._instance) return MetaGenerator._instance;
    MetaGenerator._instance = this;
  }

  #log(text, ...args) {
    console.log(`\x1b[36m[${this.name}]\x1b[0m ${text}`, ...args);
  }

  #defaultMeta() {
    return [
      {
        tag: "link",
        props: { type: "image/svg+xml", href: FIXED_FAVICON_URL },
        content: null,
      },
      {
        tag: "title",
        props: null,
        content: FIXED_PAGE_TITLE,
      },

      {
        tag: "meta",
        props: {
          name: "title",
          content: FIXED_PAGE_TITLE,
        },
      },
      {
        tag: "meta",
        props: {
          description: "title",
          content: FIXED_PAGE_TITLE,
        },
      },

      // <!-- Facebook -->
      { tag: "meta", props: { property: "og:type", content: "website" } },
      {
        tag: "meta",
        props: { property: "og:url", content: "https://anythingllm.com" },
      },
      {
        tag: "meta",
        props: {
          property: "og:title",
          content: FIXED_PAGE_TITLE,
        },
      },
      {
        tag: "meta",
        props: {
          property: "og:description",
          content: FIXED_PAGE_TITLE,
        },
      },
      {
        tag: "meta",
        props: {
          property: "og:image",
          content:
            "https://raw.githubusercontent.com/Mintplex-Labs/anything-llm/master/images/promo.png",
        },
      },

      // <!-- Twitter -->
      {
        tag: "meta",
        props: { property: "twitter:card", content: "summary_large_image" },
      },
      {
        tag: "meta",
        props: { property: "twitter:url", content: "https://anythingllm.com" },
      },
      {
        tag: "meta",
        props: {
          property: "twitter:title",
          content: FIXED_PAGE_TITLE,
        },
      },
      {
        tag: "meta",
        props: {
          property: "twitter:description",
          content: FIXED_PAGE_TITLE,
        },
      },
      {
        tag: "meta",
        props: {
          property: "twitter:image",
          content:
            "https://raw.githubusercontent.com/Mintplex-Labs/anything-llm/master/images/promo.png",
        },
      },

      { tag: "link", props: { rel: "icon", href: FIXED_FAVICON_URL } },
      {
        tag: "link",
        props: { rel: "apple-touch-icon", href: FIXED_FAVICON_URL },
      },

      // PWA specific tags
      {
        tag: "meta",
        props: { name: "mobile-web-app-capable", content: "yes" },
      },
      {
        tag: "meta",
        props: { name: "apple-mobile-web-app-capable", content: "yes" },
      },
      {
        tag: "meta",
        props: {
          name: "apple-mobile-web-app-status-bar-style",
          content: "black-translucent",
        },
      },
      { tag: "link", props: { rel: "manifest", href: "/manifest.json" } },
    ];
  }

  /**
   * Assembles Meta tags as one large string
   * @param {MetaTagDefinition[]} tagArray
   * @returns {string}
   */
  #assembleMeta() {
    const output = [];
    for (const tag of this.#customConfig) {
      let htmlString;
      htmlString = `<${tag.tag} `;

      if (tag.props !== null) {
        for (const [key, value] of Object.entries(tag.props))
          htmlString += `${key}="${value}" `;
      }

      if (tag.content) {
        htmlString += `>${tag.content}</${tag.tag}>`;
      } else {
        htmlString += `>`;
      }
      output.push(htmlString);
    }
    return output.join("\n");
  }

  async #fetchConfg() {
    this.#customConfig = this.#defaultMeta();
    return this.#customConfig;
  }

  /**
   * Clears the current config so it can be refetched on the server for next render.
   */
  clearConfig() {
    this.#customConfig = null;
  }

  /**
   *
   * @param {import('express').Response} response
   * @param {number} code
   */
  async generate(response, code = 200) {
    if (this.#customConfig === null) await this.#fetchConfg();
    response.status(code).send(`
       <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            ${this.#assembleMeta()}
            <script type="module" crossorigin src="/index.js"></script>
            <link rel="stylesheet" href="/index.css">
          </head>
          <body>
            <div id="root" class="h-screen"></div>
          </body>
        </html>`);
  }

  /**
   * Generates the manifest.json file for the PWA application on the fly.
   * @param {import('express').Response} response
   * @param {number} code
   */
  async generateManifest(response) {
    const manifestName = FIXED_PAGE_TITLE.split(" | ")[0];
    const manifest = {
      name: manifestName,
      short_name: manifestName,
      display: "standalone",
      orientation: "portrait",
      start_url: "/",
      icons: [
        {
          src: FIXED_FAVICON_URL,
          sizes: "any",
        },
      ],
    };
    response.type("application/json").status(200).send(manifest).end();
  }
}

module.exports.MetaGenerator = MetaGenerator;
