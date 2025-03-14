document.addEventListener("DOMContentLoaded", async function () {
  const response = await fetch('/stories.json');
  const collections = await response.json();
  const container = document.getElementById('stories-container');

  if (!container) return;

  const seenStories = JSON.parse(localStorage.getItem("seenStories")) || [];

  collections.forEach(collection => {
      const isSeen = collection.stories.every(story => seenStories.includes(story.id));

      const collectionElement = document.createElement('div');
      collectionElement.classList.add("story-item");

      collectionElement.innerHTML = `
          <div class="story-circle">
              <img src="${collection.image}"
                   alt="${collection.title}"
                   class="story-thumbnail ${isSeen ? 'seen' : 'new'}"
                   onclick="openStoryCollection('${collection.id}')">
              <p class="story-title">${collection.title}</p>
          </div>
      `;

      container.appendChild(collectionElement);
  });
});

function openStoryCollection(collectionId) {
  fetch('/stories.json')
      .then(response => response.json())
      .then(collections => {
          const collection = collections.find(c => c.id === collectionId);
          if (collection) {
              playStoriesSequentially(collection.stories);
          }
      });
}

function playStoriesSequentially(stories, index = 0) {
  if (index >= stories.length) {
      closeStory(); // Close modal when all stories are played
      return;
  }

  const story = stories[index];
  const modal = document.createElement('div');
  modal.innerHTML = `
      <div class="story-modal">
          <video src="${story.video}" autoplay controls></video>
      </div>
  `;
  document.body.appendChild(modal);

  // Mark story as seen
  let seenStories = JSON.parse(localStorage.getItem("seenStories")) || [];
  if (!seenStories.includes(story.id)) {
      seenStories.push(story.id);
      localStorage.setItem("seenStories", JSON.stringify(seenStories));
  }

  // Update story thumbnail styles
  updateStoryStyles();

  // Move to the next story when the video ends
  const video = modal.querySelector("video");
  video.onended = () => {
      modal.remove();
      playStoriesSequentially(stories, index + 1);
  };
}

function updateStoryStyles() {
  fetch('/stories.json')
      .then(response => response.json())
      .then(collections => {
          const seenStories = JSON.parse(localStorage.getItem("seenStories")) || [];
          collections.forEach(collection => {
              const isSeen = collection.stories.every(story => seenStories.includes(story.id));
              document.querySelectorAll(".story-thumbnail").forEach(img => {
                  if (img.onclick.toString().includes(`openStoryCollection('${collection.id}')`)) {
                      img.classList.toggle('seen', isSeen);
                      img.classList.toggle('new', !isSeen);
                  }
              });
          });
      });
}

function closeStory() {
  document.querySelector('.story-modal')?.remove();
}