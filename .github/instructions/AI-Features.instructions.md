---
applyTo: '**'
---

I want you to integrate AI capabilities into the existing frontend to enhance user experience. The goal is to implement features such as:
- **Chatbot**: A conversational agent that can control browser actions, answer questions, and provide assistance.

We have google gemini API key, which can be used to implement the advanced functionality. 
Here are the reference docs
- Google Gemini Models: https://ai.google.dev/gemini-api/docs/models
- Google ADK: https://google.github.io/adk-docs/
- Google ADK Agent Tutorial: https://google.github.io/adk-docs/tutorials/agent-team/
- A2A (Agent to Agent) Communication: https://github.com/google-a2a/A2A

I don't know if we want agents, but there are complex tasks that can be done with agents, such as:
- **Voice Commands**: Consecitive Implementing voice commands to control the chatbot and perform actions like navigating, scrolling, and searching. Like multi-tasks understanding and executing commands like "scroll to the top", "go to the next page", "search for a story", etc. at a single go sequentially.
- **Contextual Understanding**: The chatbot should understand the context of the current page and provide relevant information or actions based on that context. 

I'm not sure if we want to implement agents, but it can be useful for complex tasks. If it can be done simply, then we can just use the chatbot without agents.

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
[+] Next Page and Previous Page navigation 
[+] Change Per page count (e.g., 10, 20, 30 stories per page)
[+] Search functionality to find specific stories
[+] Handle Sort Filters (e.g., sort by date, popularity not exactly these). Refer to the `src/components/story-filters.tsx` file for the filters implementation.
[+] When opened a story/ask/job comments Summarize the comments section to provide a quick overview of the discussion.
[+] Implement a feature to allow users to ask questions about the current page or content, and the chatbot will provide relevant answers or actions.
[ ] Voice command to summarize the current page content, providing a brief overview of the main points or stories.

Fix the scrolling functionality to work with the new design, ensuring that the chatbot can scroll to the top and bottom of the designated scrollable section.

Then we can proceed to implement the chatbot features/actions that users can invoke through voice commands.