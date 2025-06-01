---
applyTo: '**'
---

I want you to integrate AI capabilities into the existing frontend to enhance user experience. The goal is to implement features such as:
- **Chatbot**: A conversational agent that can control browser actions, answer questions, and provide assistance.

[+] - indicate that the feature is already implemented
[ ] - indicate that the feature is not yet implemented

We already developed voice commands implemented some features access. Some of them are:
[+] Switching between themes
[+] Scrolling to the top and bottom of the page (but it is not working now because of new design. The scrollable section is not the whole page anymore it is just a part of the page you can check layout in the `src/app/page.tsx` file and the `src/app/layout.tsx` file)
[+] Navigating back and forward in history
[+] Refreshing the page
[+] Navigating to storytypes (can refer to the `src/app/page.tsx` code to get storytypes)
```javascript
  // src/app/page.tsx
  // Story type tabs
  const storyTypes = [
    { id: 'top', label: 'Top' },
    { id: 'new', label: 'New' },
    { id: 'best', label: 'Best' },
    { id: 'ask', label: 'Ask HN' },
    { id: 'show', label: 'Show HN' },
    { id: 'job', label: 'Jobs' }
  ]
```
[ ] Next Page and Previous Page navigation 
[ ] Change Per page count (e.g., 10, 20, 30 stories per page)
[ ] Search functionality to find specific stories
[ ] Handle Sort Filters (e.g., sort by date, popularity not exactly these). Refer to the `src/components/story-filters.tsx` file for the filters implementation.

Fix the scrolling functionality to work with the new design, ensuring that the chatbot can scroll to the top and bottom of the designated scrollable section.

Then we can proceed to implement the chatbot features/actions that users can invoke through voice commands.