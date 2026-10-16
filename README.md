# CHAIMS Artistry — luxury one-page website

Responsive static website using HTML5, CSS3 and vanilla JavaScript. No server, database, checkout or booking engine required.

## Files

- `index.html` — sections and content
- `assets/styles.css` — styling and responsive layouts
- `assets/script.js` — calendar configuration, mobile menu and current year
- `assets/logo.jpg` — original uploaded CHAIMS logo, unchanged
- `assets/launch-artwork.png` — original uploaded launch artwork, unchanged, retained as a brand asset

## Before publishing — replace these placeholders

| Placeholder | File | Action |
| --- | --- | --- |
| `YOUR_GOOGLE_CALENDAR_EMBED_URL` | `assets/script.js` | Paste public Google Calendar iframe `src` URL (not the whole iframe HTML). |
| `YOUR_INSTAGRAM_HANDLE` | `index.html` | Replace in visible text and profile URL; remove `@` from the URL part if needed. |
| `YOUR_TIKTOK_HANDLE` | `index.html` | Replace in visible text and profile URL. |
| `+32 XXX XX XX XX` | `index.html` | Set displayed telephone number. |
| `tel:+32000000000` | `index.html` | Set real number in international `tel:+32...` format. |

Review all prices, duration, travel fee, preparation advice, and reservation policy before launch. The sample prices are taken from the supplied CHAIMS price-list image.

## Google Calendar embed setup

1. Create a **separate calendar** exclusively for public appointment information. **Do not publish your personal calendar** or customer names, phone numbers, notes, or private booking details.
2. On desktop, open [Google Calendar](https://calendar.google.com), find the new calendar under **Settings for my calendars**, and open **Access permissions for events**. Enable public access only if you want anyone to see it. Public calendar entries may be indexed or visible beyond your site.
3. Under **Integrate calendar**, copy the iframe embed URL from the `src` attribute of the embed code. It generally begins with `https://calendar.google.com/calendar/embed?...`.
4. Open `assets/script.js` and replace the value of `GOOGLE_CALENDAR_EMBED_URL` with that URL, keeping the quotes. If your embed code uses HTML-escaped `&amp;`, convert these to `&` in the JavaScript URL.
5. Use generic blocks such as **Available** or **Unavailable**. Check the published site in a private browser window to confirm it displays without requiring sign-in.

**Important:** The calendar only displays information. It does **not** accept bookings, take deposits, verify payments, or automatically confirm appointments. Clients must contact CHAIMS and wait for personal confirmation/payment instructions. Google Calendar iframe functionality on narrow phones is limited by Google's own embed UI; the frame remains scrollable and fits the available width.

## Deploy to GitHub Pages (free)

1. Create a GitHub repository, e.g. `chaims-artistry`.
2. Upload `index.html`, `README.md`, and the entire `assets` folder to the repository root.
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**. Select `main` and `/ (root)`, then **Save**.
5. Once GitHub finishes deploying, open the URL shown in Pages, typically `https://YOUR_USERNAME.github.io/chaims-artistry/`.
6. Test the mobile menu, navigation, Instagram, TikTok, telephone link and calendar. All local assets use relative paths, so the site works in a project subdirectory.

## Notes

- Headings use Cormorant Garamond, body uses DM Sans via Google Fonts, with local system font fallbacks. Fonts require internet access, but the page still works if unavailable.
- No external JavaScript packages or analytics.
- For privacy, only the separate public availability calendar should be embedded.
- Respect motion-reduction settings; smooth scrolling and animations are disabled for users requesting reduced motion.
- The original logo file is used as-is, without recreating or distorting it.


## Mobile responsiveness

The site includes layouts for phones (including 320–380px screens), tablets and desktop. On narrow screens, the navigation becomes a touch-friendly menu, service/preparation/contact cards stack vertically, the calendar resizes to the viewport, and text scales to prevent horizontal overflow. Note that Google Calendar's own iframe interface is controlled by Google and may require users to scroll within the calendar on smaller phones.
