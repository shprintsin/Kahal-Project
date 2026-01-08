import { ActionButton, Author, Category, CategoryButton, CitationInfo, FooterItem, NavItem } from "@/app/types";

import {
    FaSearch,
    FaHome,
    FaBook,
    FaDatabase,
    FaArchive,
    FaChevronDown,
    FaArrowLeft,
    FaFileExcel,
} from "react-icons/fa"
import { FaCoins, FaUsers, FaLandmark, FaMap } from 'react-icons/fa'


export const postsMockData = [
  {
    id: 1,
    title: "מפקד יהודי פולין-ליטא ",
    excerpt: "נתוני המפקד היהודי של 1765 בחלוקה לפי ישובים וסביבות",
    date: "1 בינואר 2024",
    author: "מחבר ראשון",
    imageUrl: "/images/post1.jpg"
  },
  {
    id: 2,
    title: "מפקד יהודי גליציה 1900",
    excerpt: "נתוני מפקד האוכלוסין באוסטרו-הונגריה בשנת 1900",
    date: "2 בינואר 2024",
    author: "מחבר שני",
    imageUrl: "/images/post2.jpg"
  },
  {
    id: 3,
    title: "תשלומי המיסים לכתר במחצית הראשונה של המאה ה18",
    excerpt: "מסד נתונים של תשלומי המיסים של הקהילות היהודיות בין 1721-1764",
    date: "3 בינואר 2024",
    author: "מחבר שלישי",
    imageUrl: "/images/post3.jpg"
  },
  {
    id: 4,
    title: "פרויקט שנת ההקמה ",
    excerpt: "שנת ההקמה של כל ישוב יהודי בפולין ליטא מהתחלת ההתיישבות ועד סוף המאה ה-18",
    date: "3 בינואר 2024",
    author: "מחבר שלישי",
    imageUrl: "/images/post3.jpg"
  }
];

// Sample sources data

const AUTHORS=`
ד"ר יניי שפיצר| חוקר ראשי|האוניברסיטה העברית בירושלים|yannay.spitzer@mail.huji.ac.il
שניאור שפרינצין | עוזר מחקר| האוניברסיטה העברית בירושלים|shprintsin.shnyor.huji.ac.il
`

// Sample authors data
export const authorsMockData: Author[] = AUTHORS.split('\n').map(line => {
  const [name, role, affiliation, email] = line.split('|').map(item => item.trim());
  return {
    name,
    role,
    affiliation,
    email
  };
}
).filter(author => author.name && author.role && author.affiliation && author.email);

// Sample citation info
export const citationInfoMockData: CitationInfo = {
  title: 'פרויקט קהילות מזרח אירופה',
  authors: 'כהן, י., לוי, ש., ואברהם, ד.',
  year: '2024',
  url: 'https://example.com/project',
  citationText: 'Spitzer, Y., Shprintsin, S. (2024). The Eastern European Jewish Communities Project. Retrieved from https://example.com/project',
};

// Footer links data
export const footerLinksMockData = [
  { label: "אודות", href: "/about" },
  { label: "צור קשר", href: "/contact" },
  { label: "מדיניות פרטיות", href: "/privacy" }
];

export const copyrightTextMockData = "© 2024 פרויקט הקהל. כל הזכויות שמורות.";




export const heroText = {
  title: "1000 שנות היסטוריה",
  subtitle: "פרויקט קהילות מזרח אירופה"
}


export const actionItems: Record<string, ActionButton> = {
  button1: {
    icon: <FaFileExcel />,
    title: "Excel / Stata",
    href: "#"
  },
  button2: {
    icon: <FaArrowLeft />,
    title: "מה חדש",
    href: "#"
  }
};


export const footerItems: FooterItem[] = [
  {
    label: "API",
    icon: "FaCode",
    href: "#"
  },
  {
    label: "GITHUB",
    icon: "FaGithub",
    href: "#"
  },
  {
    label: "דוקומנטציה",
    icon: "FaBook",
    href: "#"
  }
]; 

export const categories: Category[] = [
  { id: 'demography', title: 'דמוגרפיה', slug: 'demography' },
  { id: 'economy', title: 'כלכלה', slug: 'economy' },
  { id: 'culture', title: 'תרבות', slug: 'culture' },
  { id: 'history', title: 'היסטוריה', slug: 'history' },
];

export const HomeCategories: CategoryButton[] = [
  {
    id: 'archive',
    title: 'אוספים',
    icon: "FaArchive",
      href: '/archive',
    hoverColor: 'text-yellow-300'
  },
  {
    id: 'data',
    title: 'נתונים',
      href: '/data',
    
    icon: "FaDatabase",
    hoverColor: 'text-blue-300'
  },
  {
    id: 'resources',
    title: 'משאבים',
      href: '/resources',

    icon: "FaLandmark",
    hoverColor: 'text-purple-300'
  },
  {
    id: 'layers',
    title: 'מפות',
      href: '/layers',
    icon: "FaMap" ,
    hoverColor: 'text-green-300'
  }
]


export const GetIcons = ({icon,className}:{icon:string,className:string}) => {
  switch (icon) {
    case "FaSearch":
      return <FaSearch className={className} />;
    case "FaHome":
      return <FaHome className={className} />;
    case "FaBook":
      return <FaBook className={className} />;
    case "FaDatabase":
      return <FaDatabase className={className} />;
    case "FaArchive":
      return <FaArchive className={className} />;
    case "FaChevronDown":
      return <FaChevronDown className={className} />;
    case "FaCoins":
      return <FaCoins className={className} />;
    case "FaUsers":
      return <FaUsers className={className} />;
    case "FaLandmark":
      return <FaLandmark className={className} />;
    case "FaMap":
      return <FaMap className={className} />;
    case "FaFileExcel":
      return <FaFileExcel className={className} />;
    case "FaArrowLeft":
      return <FaArrowLeft className={className} />;
    case "FaGithub":
      return <FaArrowLeft className={className} />;
    case "FaCode":
      return <FaArrowLeft className={className} />;
    case "FaDatabase":
      return <FaDatabase className={className} />;
    case "FaSearch":
      return <FaSearch className={className} />;
    case "FaHome":
      return <FaHome className={className} />;
    case "FaBook":
      return <FaBook className={className} />;
    case "FaArchive":
      return <FaArchive className={className} />;
    case "FaChevronDown":
      return <FaChevronDown className={className} />;
    default:
      return null;
  }
}


export const navigation: NavItem[] = [
  {
    label: "בית",
    icon: "FaHome",
    href: "/"
  },  
  {
    label: "דוקומנטציה",
    icon: "FaBook",
    href: "#"
  },
  {
    label: "נתונים",
    icon: "FaDatabase",
    href: "/data"
  },
  {
    label: "מפות",
    icon: "FaMap",
    href: "/maps"
  },
  
    {
      label: "משאבים",
      icon: "FaArchive",
      href: "#",
      subItems: [
        { label: "מאמרים", icon: null, href: "#" },
        { label: "ספרים", icon: null, href: "#" },
        { label: "מסמכים היסטוריים", icon: null, href: "#" },
        { label: "תמונות וצילומים", icon: null, href: "#" }
      ]
    }
  
  ]


  export const POST = {
    id: 1,
    title: "קהילת יהודי פראג במאה ה-16",
    subtitle: "מחקר היסטורי על התפתחות הקהילה היהודית בפראג",
    author: "ד״ר יוסף כהן",
    date: "15 בינואר 2024",
    category: "דמוגרפיה",
    content: `
      <p>
        קהילת יהודי פראג במאה ה-16 הייתה אחת הקהילות המשגשגות והחשובות באירופה. 
        הקהילה התפתחה תחת שלטונו של הקיסר רודולף השני, שהעניק ליהודים זכויות מסוימות 
        והגנה יחסית, דבר שאפשר את פריחתה של הקהילה בתחומי המסחר, האומנות והלמדנות.
      </p>
      <h2 id="demographic-development">התפתחות דמוגרפית</h2>
      <p>
        במהלך המאה ה-16, גדלה אוכלוסיית יהודי פראג באופן משמעותי. מנתונים שנאספו 
        ממפקדי אוכלוסין ורישומי מס מהתקופה, ניתן להעריך כי בשנת 1522 מנתה הקהילה 
        כ-600 נפש, ואילו בשנת 1599 כבר מנתה למעלה מ-1,500 נפש.
      </p>
      <p>
        הגידול הדמוגרפי נבע הן מריבוי טבעי והן מהגירה של יהודים מאזורים אחרים באירופה, 
        בעיקר בעקבות גירושים וגזירות שהוטלו על קהילות יהודיות במקומות אחרים.
      </p>
      <h2 id="economic-structure">מבנה כלכלי</h2>
      <p>
        הקהילה היהודית בפראג התאפיינה במבנה כלכלי מגוון. חלק ניכר מיהודי העיר עסקו 
        במסחר, בעיקר במסחר בינלאומי עם קהילות יהודיות אחרות ברחבי אירופה. בנוסף, 
        רבים עסקו במלאכות שונות כגון צורפות, חייטות וייצור כלי זכוכית.
      </p>
      <h2 id="religious-life">חיי דת ורוח</h2>
      <p>
        פראג הייתה מרכז רוחני חשוב ליהדות אירופה במאה ה-16. בית הכנסת אלטנוישול, 
        שנבנה במאה ה-13, היה מוקד לחיי הדת של הקהילה. בתקופה זו פעלו בפראג מספר 
        חכמים ורבנים חשובים, ביניהם המהר"ל מפראג (רבי יהודה ליווא בן בצלאל), 
        שהשפעתו על הקהילה והיהדות בכלל הייתה משמעותית ביותר.
      </p>
      <h2 id="cultural-achievements">הישגים תרבותיים</h2>
      <p>
        הקהילה היהודית בפראג הצטיינה גם בתחום התרבות והאמנות. בתי הדפוס היהודיים 
        בפראג היו מהחשובים באירופה, והדפיסו ספרי קודש, ספרות יהודית וחיבורים מדעיים. 
        בנוסף, התפתחה בפראג אמנות יהודית ייחודית, בעיקר בתחומי האדריכלות, עיצוב 
        תשמישי קדושה ואמנות המצבות.
      </p>
      <h2 id="community-relations">יחסים עם הסביבה</h2>
      <p>
        היחסים בין הקהילה היהודית לבין האוכלוסייה הנוצרית בפראג היו מורכבים. מצד אחד, 
        היהודים סבלו מהגבלות שונות ומפעם לפעם גם מפרעות ורדיפות. מצד שני, בתקופת 
        שלטונו של הקיסר רודולף השני, נהנו היהודים מתקופה של יציבות יחסית ואף שגשוג, 
        והצליחו לפתח קשרים כלכליים ותרבותיים עם הסביבה הנוצרית.
      </p>
      <h2 id="conclusions">מסקנות ותובנות</h2>
      <p>
        המחקר על קהילת יהודי פראג במאה ה-16 מספק תובנות חשובות על החיים היהודיים 
        באירופה בתקופת הרנסנס. הקהילה שימשה דוגמה לאופן שבו קהילה יהודית יכולה 
        לשגשג גם בתנאים מורכבים, תוך שמירה על זהותה הייחודית מחד, ויצירת קשרים 
        עם הסביבה מאידך. הישגיה של הקהילה בתחומי הכלכלה, הדת והתרבות השפיעו 
        על קהילות יהודיות אחרות באירופה ותרמו להתפתחות היהדות בכללותה.
      </p>
    `,
    headings: [
      { id: "demographic-development", title: "התפתחות דמוגרפית" },
      { id: "economic-structure", title: "מבנה כלכלי" },
      { id: "religious-life", title: "חיי דת ורוח" },
      { id: "cultural-achievements", title: "הישגים תרבותיים" },
      { id: "community-relations", title: "יחסים עם הסביבה" },
      { id: "conclusions", title: "מסקנות ותובנות" },
    ],
    relatedPosts: [
      { id: "1", title: "קהילות יהודיות בבוהמיה", category: "דמוגרפיה" },
      { id: "2", title: "המהר״ל מפראג והשפעתו", category: "מוסדות" },
    ],
  
    sources: [
      { id: "1", title: "מקור ראשון", author: "ד״ר אברהם לוי", year: "2020" },
      { id: "2", title: "מקור שני", author: "פרופ׳ שרה כהן", year: "2018" },
    ],
    tags: ["פראג", "מאה 16", "דמוגרפיה", "קהילות יהודיות", "בוהמיה"],
    imageUrl: "/placeholder.svg?height=400&width=800",
  }  

export const sourcesMockData = [
  {
    id: 1,
    title: "מפקד יהודי פולין-ליטא",
    description: "נתוני המפקד היהודי של 1765 בחלוקה לפי ישובים וסביבות",
    date: "1765",
    type: "מפקד",
    imageUrl: "/images/source1.jpg",
    url: "/sources/1"
  },
  {
    id: 2,
    title: "מפקד יהודי גליציה",
    description: "נתוני מפקד האוכלוסין באוסטרו-הונגריה בשנת 1900",
    date: "1900",
    type: "מפקד",
    imageUrl: "/images/source2.jpg",
    url: "/sources/2"
  }
];


  
