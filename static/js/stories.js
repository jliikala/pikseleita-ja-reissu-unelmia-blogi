document.addEventListener("DOMContentLoaded", async function () {
  try {
      const response = await fetch('/stories.json');
      if (!response.ok) throw new Error("Failed to load stories.json");
      const collections = await response.json();
      const container = document.getElementById('stories-container');
      if (!container) return;
      const seenStories = new Set(JSON.parse(localStorage.getItem("seenStories")) || []);

      collections.forEach(collection => {
          const isSeen = collection.stories.every(story => seenStories.has(story.id));
          const collectionElement = document.createElement('div');
          collectionElement.classList.add("story-item");
          collectionElement.innerHTML = `
              <div class="story-circle ${isSeen ? 'seen' : 'new'}" onclick="openStoryCollection('${collection.id}')">
                  <img src="${collection.image}" alt="${collection.title}" class="story-thumbnail">
                  <p class="story-title">${collection.title}</p>
              </div>
          `;
          container.appendChild(collectionElement);
      });
  } catch (error) {
      console.error("Error loading stories:", error);
  }
});

function openStoryCollection(collectionId) {
  fetch('/stories.json')
      .then(response => {
          if (!response.ok) throw new Error("Failed to load stories.json");
          return response.json();
      })
      .then(collections => {
          const collection = collections.find(c => c.id === collectionId);
          if (!collection) {
              console.error("Collection not found:", collectionId);
              return;
          }
          const lightboxItems = collection.stories.map(story => ({
              href: story.video || story.image,
              type: story.video ? 'video' : 'image',
              source: story.video ? 'local' : '',
              autoplayVideos: true
          }));

          const lightbox = GLightbox({
              elements: lightboxItems,
              autoplayVideos: true,
              openEffect: 'fade',
              closeEffect: 'fade',
              onOpen: () => markStoriesAsSeen(collection.stories.map(story => story.id))
          });
          lightbox.open();
      })
      .catch(error => console.error("Error opening story collection:", error));
}

function markStoriesAsSeen(storyIds) {
  let seenStories = new Set(JSON.parse(localStorage.getItem("seenStories")) || []);
  storyIds.forEach(id => seenStories.add(id));
  localStorage.setItem("seenStories", JSON.stringify([...seenStories]));
  updateStoryStyles();
}

function updateStoryStyles() {
  fetch('/stories.json')
      .then(response => response.json())
      .then(collections => {
          const seenStories = new Set(JSON.parse(localStorage.getItem("seenStories")) || []);
          collections.forEach(collection => {
              const isSeen = collection.stories.every(story => seenStories.has(story.id));
              document.querySelectorAll(".story-circle").forEach(circle => {
                  if (circle.onclick.toString().includes(`openStoryCollection('${collection.id}')`)) {
                      circle.classList.toggle('seen', isSeen);
                      circle.classList.toggle('new', !isSeen);
                  }
              });
          });
      })
      .catch(error => console.error("Error updating story styles:", error));
}
