export type Lang = 'en' | 'ne';
export const langs: Lang[] = ['en', 'ne'];
export const pick = (lang: Lang, en: string, ne: string) => lang === 'ne' ? ne : en;
export const tools = [
  { id: 'date-converter', icon: 'calendar', color: 'coral', category: 'dates', title: ['BS ⇄ AD date converter', 'वि.सं. ⇄ ई.सं. मिति'], short: ['Date converter', 'मिति परिवर्तन'], description: ['Two calendars. One clear answer. Convert Nepali and English dates.', 'नेपाली र अंग्रेजी मिति सजिलै परिवर्तन गर्नुहोस्।'], tags: ['BS ⇄ AD', 'वि.सं. ⇄ ई.सं.'], aliases: 'date converter miti pariwartan nepali english bs ad miti मिति परिवर्तन नेपाली अंग्रेजी पात्रो' },
  { id: 'age-calculator', icon: 'cake', color: 'blue', category: 'dates', title: ['Age on a date', 'तोकिएको मितिमा उमेर'], short: ['Age calculator', 'उमेर गणना'], description: ['Know your exact age today, or on an application deadline.', 'आज वा आवेदनको अन्तिम मितिमा पूरा भएको उमेर थाहा पाउनुहोस्।'], tags: ['Years · months · days', 'वर्ष · महिना · दिन'], aliases: 'age calculator birthday cutoff deadline umer ganana janma janma miti उमेर जन्म मिति' },
  { id: 'preeti-unicode', icon: 'type', color: 'violet', category: 'text', title: ['Preeti to Unicode', 'प्रीतिबाट युनिकोड'], short: ['Preeti to Unicode', 'प्रीतिबाट युनिकोड'], description: ['Turn legacy Nepali text into text you can use everywhere.', 'पुरानो प्रीति अक्षरलाई सबैतिर चल्ने नेपाली युनिकोडमा बदल्नुहोस्।'], tags: ['Copy & paste', 'कपी र पेस्ट'], aliases: 'preeti unicode nepali font text conversion priti प्रीति युनिकोड नेपाली अक्षर' },
  { id: 'photo-resizer', icon: 'crop', color: 'green', category: 'files', title: ['Photo resize & compress', 'फोटोको आकार घटाउनुहोस्'], short: ['Photo resizer', 'फोटो मिलाउने'], description: ['The right dimensions. A smaller file. Ready for your next form.', 'फोटोको लम्बाइ, चौडाइ र फाइलको आकार मिलाउनुहोस्।'], tags: ['JPG · PNG · WebP', 'JPG · PNG · WebP'], aliases: 'photo image resize compress reduce size kb jpg png webp passport फोटो साइज आकार घटाउने' },
  { id: 'land-converter', icon: 'land', color: 'amber', category: 'numbers', title: ['Nepal land-area converter', 'जग्गाको क्षेत्रफल परिवर्तन'], short: ['Land-area converter', 'जग्गाको क्षेत्रफल'], description: ['Ropani or Bigha? Make sense of land measurements in seconds.', 'रोपनी, आना, बिघा र कठ्ठाको क्षेत्रफल एकै ठाउँमा बुझ्नुहोस्।'], tags: ['Ropani · Bigha · m²', 'रोपनी · बिघा · वर्ग मिटर'], aliases: 'land area ropani aana paisa daam bigha kattha dhur square feet meter jagga जग्गा क्षेत्रफल रोपनी आना पैसा दाम बिघा कठ्ठा धुर' },
] as const;
export type Tool = typeof tools[number];
export const categories = [
  ['all', 'All tools', 'सबै उपकरण', 'grid'], ['dates', 'Dates & age', 'मिति र उमेर', 'calendar'],
  ['text', 'Nepali text', 'नेपाली अक्षर', 'type'], ['files', 'Photos & files', 'फोटो र फाइल', 'image'],
  ['numbers', 'Measurements', 'नापजाँच', 'land'],
] as const;
export const route = (lang: Lang, path = '') => `/${lang}/${path}${path && !path.endsWith('/') ? '/' : ''}`;
export const toolText = (tool: Tool, key: 'title' | 'short' | 'description' | 'tags', lang: Lang) => tool[key][lang === 'ne' ? 1 : 0];
