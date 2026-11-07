import { withBase } from './paths';
export type Lang = 'en' | 'ne';
export const langs: Lang[] = ['en', 'ne'];
export const pick = (lang: Lang, en: string, ne: string) => lang === 'ne' ? ne : en;
export const tools = [
  { id: 'date-converter', icon: 'calendar', color: 'coral', category: 'dates', title: ['BS ⇄ AD date converter', 'नेपाली ⇄ अंग्रेजी मिति'], short: ['Date converter', 'मिति रूपान्तरण'], description: ['Two calendars. One clear answer. Convert Nepali and English dates.', 'नेपाली मितिलाई अंग्रेजीमा वा अंग्रेजी मितिलाई नेपालीमा बदल्नुहोस्।'], tags: ['BS ⇄ AD', 'वि.सं. ⇄ ई.सं.'], aliases: 'date converter miti pariwartan nepali english bs ad miti मिति रूपान्तरण नेपाली अंग्रेजी पात्रो' },
  { id: 'age-calculator', icon: 'cake', color: 'blue', category: 'dates', title: ['Age on a date', 'उमेर कति पुग्यो?'], short: ['Age calculator', 'उमेर गणना'], description: ['Know your exact age today, or on an application deadline.', 'आज वा आफूले छानेको मितिमा कति वर्ष, महिना र दिन पुग्यो, थाहा पाउनुहोस्।'], tags: ['Years · months · days', 'वर्ष · महिना · दिन'], aliases: 'age calculator birthday cutoff deadline umer ganana janma janma miti उमेर जन्म मिति' },
  { id: 'preeti-unicode', icon: 'type', color: 'violet', category: 'text', title: ['Preeti to Unicode', 'प्रीतिबाट युनिकोड'], short: ['Preeti to Unicode', 'प्रीतिबाट युनिकोड'], description: ['Turn legacy Nepali text into text you can use everywhere.', 'प्रीति फन्टमा लेखिएको पाठलाई युनिकोडमा बदलेर जहाँ पनि प्रयोग गर्नुहोस्।'], tags: ['Copy & paste', 'कपी र पेस्ट'], aliases: 'preeti unicode nepali font text conversion priti प्रीति युनिकोड नेपाली अक्षर' },
  { id: 'photo-resizer', icon: 'crop', color: 'green', category: 'files', title: ['Photo resize & compress', 'फोटोको साइज मिलाउनुहोस्'], short: ['Photo resizer', 'फोटो मिलाउने'], description: ['The right dimensions. A smaller file. Ready for your next form.', 'फाराममा मिल्ने गरी फोटोको चौडाइ, उचाइ र फाइलको साइज मिलाउनुहोस्।'], tags: ['JPG · PNG · WebP', 'JPG · PNG · WebP'], aliases: 'photo image resize compress reduce size kb jpg png webp passport फोटो साइज आकार घटाउने' },
  { id: 'pdf-tools', icon: 'file', color: 'blue', category: 'files', title: ['Everyday PDF tools', 'PDF का सजिला काम'], short: ['PDF tools', 'PDF उपकरण'], description: ['Extract pages, merge PDFs, reduce file size or save a page as an image.', 'पाना छुट्याउनुहोस्, PDF जोड्नुहोस्, साइज घटाउनुहोस् वा पानालाई फोटो बनाउनुहोस्।'], tags: ['Extract · merge · compress · image', 'छुट्याउने · जोड्ने · साइज घटाउने · फोटो'], aliases: 'pdf tools extract split merge combine compress reduce size page image jpg png document पीडीएफ पिडिएफ पाना पृष्ठ छुट्याउने जोड्ने घटाउने कागजात फोटो' },
  { id: 'land-converter', icon: 'land', color: 'amber', category: 'numbers', title: ['Nepal land-area converter', 'जग्गाको नाप रूपान्तरण'], short: ['Land-area converter', 'जग्गाको नाप'], description: ['Ropani or Bigha? Make sense of land measurements in seconds.', 'रोपनी, आना, बिघा, कठ्ठा वा वर्ग मिटरमा जग्गाको नाप निकाल्नुहोस्।'], tags: ['Ropani · Bigha · m²', 'रोपनी · बिघा · वर्ग मिटर'], aliases: 'land area ropani aana paisa daam bigha kattha dhur square feet meter jagga जग्गा क्षेत्रफल रोपनी आना पैसा दाम बिघा कठ्ठा धुर' },
] as const;
export type Tool = typeof tools[number];
export const categories = [
  ['all', 'All tools', 'सबै उपकरण', 'grid'], ['dates', 'Dates & age', 'मिति र उमेर', 'calendar'],
  ['text', 'Nepali text', 'नेपाली पाठ', 'type'], ['files', 'Photos & files', 'फोटो र फाइल', 'image'],
  ['numbers', 'Measurements', 'नाप र क्षेत्रफल', 'land'],
] as const;
export const route = (lang: Lang, path = '') => withBase(`${lang}/${path}${path && !path.endsWith('/') ? '/' : ''}`);
export const toolText = (tool: Tool, key: 'title' | 'short' | 'description' | 'tags', lang: Lang) => tool[key][lang === 'ne' ? 1 : 0];
