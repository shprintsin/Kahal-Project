TODO:

1.  layers model dose not work:
    Runtime TypeError
    Server
    Failed to parse URL from /api/geo/layers
    Call Stack

2.  Collections dosent work
    app\collections\page.tsx (8:17) @ getCollectionsWithSeries

    6 | try {
    7 | const API_URL = process.env.NEXT_PUBLIC_ADMIN_API_URL || 'http://localhost:3001';

    > 8 | const res = await fetch(`${API_URL}/api/collections`, {

         |                 ^

    9 | cache: 'no-store',
    10 | });
    11 |

3.  archive dosent work
    שגיאה בטעינת הארכיון
    Failed to parse URL from /api/collections

4.  documents dosent work

5.  http://localhost:3000/posts dosent work
    Failed to parse URL from /api/posts?status=published

6.  datasets dosent work
    Use the `defaultValue` or `value` props instead of setting children on <textarea>.
    app/components/pages_components/HomePage.tsx (112:22) @ HomePageComponent

110 | <Row><UpdateSection posts={posts} sources={sources} /></Row>
111 |

> 112 | <Row><CreditSection authors={authors} citationInfo={citationInfo} /></Row>

      |                      ^

113 | </Col>
114 |
115 | </div>
Call Stack
17

Show 14 ignore-listed frame(s)
textarea
