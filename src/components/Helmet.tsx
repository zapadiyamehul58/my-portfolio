import { useEffect } from "react";

interface HelmetProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

export default function Helmet({ title, description, image, url, schema }: HelmetProps & { schema?: string }) {
  useEffect(() => {
    // Helper to update or create meta tags
    const setMetaTag = (attribute: string, key: string, content: string) => {
      let element = document.querySelector(`meta[${attribute}="${key}"]`);
      if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
      }
      element.setAttribute("content", content);
    };

    if (title) {
      document.title = title;
      setMetaTag("property", "og:title", title);
      setMetaTag("name", "twitter:title", title);
    }
    
    if (description) {
      setMetaTag("name", "description", description);
      setMetaTag("property", "og:description", description);
      setMetaTag("name", "twitter:description", description);
    }

    if (image) {
      setMetaTag("property", "og:image", image);
      setMetaTag("name", "twitter:image", image);
      setMetaTag("name", "twitter:card", "summary_large_image");
    }

    if (url) {
      setMetaTag("property", "og:url", url);
      
      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", url);
    }
    
    // JSON-LD Schema
    if (schema) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement('script');
        script.setAttribute('type', 'application/ld+json');
        document.head.appendChild(script);
      }
      script.textContent = schema;
    }
    
    // Apple & General Metas
    setMetaTag("name", "apple-mobile-web-app-capable", "yes");
    setMetaTag("name", "apple-mobile-web-app-status-bar-style", "black-translucent");
    setMetaTag("name", "apple-mobile-web-app-title", "Mehul Zapadiya");
    
  }, [title, description, image, url, schema]);

  return null;
}

