# FLCut

FLCut is a link shortner for the Finite Loop Club. It can shorten the event link of any platform like Instagram , linkedin , Youtube etc.
This reduces the lenght of the link and also can track link usage. This helps is having a simple and clean url for sharing through various platforms and is managed by the core team.

## Tech Stack

- Next.js App Router with TypeScript
- React server components and server actions
- Tailwind CSS
- Prisma 
- PostgreSQL
- Zod for form validation

## Core Features

- It can create short links from the user entered lenghty links.
- The maintainer can customize slug, title, event name, channel, and expiry date
- If no slug is given , then automatic slug will be created
- Dashboard can only be accessed by using the password , currently it is "flcut123"
- Maintainer can specify the link expiery time
- If the link expiers , then it will display ,link expired page
- If the link is not created or the slug is wrong then it will display the link not found page.
- Status or the analytics of the link can be tracked , active, inactive, expired unique clicks etc
- Unique click is counted for a a first-party visitor cookie
- Protected dashboard with link list, search, sorting, and simple per-link analytics

### Unique Click

A unique click is counted as one visitor per link within a 24-hour window.

### Expired And Invalid Link Behavior

Expired or inactive links do not redirect to the original link. Instead,it shows a expired-link page which shows two option either back to the home page or dashboard login.

## Data Model
- `Link`: stores slug, destination URL, metadata, status, expiry, and click counters.
- `ClickEvent`: stores individual visits, referrer, user agent, hashed IP, visitor cookie id, and uniqueness flag.

## Design Decisions

- Shared-password authentication is used for simple flow so that  FLC Digital or Event Management team can easily login.
- The analytics page uses simple summaries and activity lists.
- Slug generation is intentionally basic and short, and if Duplicate exists then it will warn.
- IP addresses are hashed before storage.

## DEPLOYED URL : https://flcut-seven.vercel.app/
NOTE: Login Password is 'flcut123'

### What I would build in 4 hours
- I would build the link creation flow
- Admin Login
- Basic dashboard for analysis
### What i would skip
- Detailed analysis pages for every link
- Event search and Sorting operation
- Complex dashboard
- Some options while link creation like, app name, event name


