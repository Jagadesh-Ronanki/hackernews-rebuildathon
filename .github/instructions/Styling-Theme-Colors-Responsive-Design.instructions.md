---
applyTo: '**'
---

The styling of the website should be consistent and visually appealing. Here are the guidelines for styling, theme colors, and responsive design:
## Theme Colors
- Use a consistent color palette throughout the website.
- The primary color should be used for buttons, links, and important elements.
- The secondary color can be used for backgrounds and less important elements.
- Use neutral colors for text and backgrounds to ensure readability.
- Ensure that the color contrast meets accessibility standards.

The Navigation Bar (navbar.tsx) is well themed and the main page background color is set to light orange with blur effect. The primary color is set to blue and the secondary color is set to light gray.

The immediate home screen on visit is absolutely stunning with a light orange background and a blur effect. The primary color is blue, which is used for buttons and links, while the secondary color is light gray, used for backgrounds and less important elements.

Your task is to ensure that the theme colors are applied consistently across all components and pages.

## Responsive Design
- The website should be fully responsive and adapt to different screen sizes.
Navbar.tsx is already responsive, adjusting its layout based on the screen size.
- Use media queries to adjust styles for different devices (mobile, tablet, desktop).
- Ensure that text, images, and other elements scale appropriately on different devices.
- Test the website on various devices and screen sizes to ensure a consistent user experience.
- Use flexible grid layouts and CSS Flexbox or Grid for layout management.

All 'bg-white' variants should be replaced with 'bg-orange-200/10 backdrop-blur-md' even in the dark mode. This will ensure that the background color remains consistent with the theme and provides a visually appealing blur effect. dark:bg-gray-900 should be removed.