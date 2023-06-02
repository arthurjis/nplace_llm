export default function detectLanguage() {
    const defaultLang = 'en';  // Default language
    const supportedLangs = ['en', 'zh'];  // Supported languages
    const userLang = (navigator.language || navigator.userLanguage).substring(0, 2); 
    // Return corresponding language code if it's supported, else return default language
    return supportedLangs.includes(userLang) ? userLang : defaultLang;
  }