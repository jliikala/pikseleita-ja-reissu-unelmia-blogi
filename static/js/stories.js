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

let currentCollection = null;
let currentStoryIndex = 0;

function openStoryCollection(collectionId) {
  fetch('/stories.json')
      .then(response => response.json())
      .then(collections => {
          const collection = collections.find(c => c.id === collectionId);
          if (!collection) return;

          currentCollection = collection;
          currentStoryIndex = 0;
          showStory(collection.stories[currentStoryIndex]);
      });
}

function showStory(story) {
  if (!story || !story.url) {
      console.error("Invalid story object:", story);
      return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'story-overlay';
  overlay.innerHTML = `
      <div id="story-content">
          <video id="story-video" src="${story.url}" autoplay controls></video>
          <button id="prev-story" onclick="prevStory()">◀</button>
          <button id="next-story" onclick="nextStory()">▶</button>
          <button id="close-story" onclick="closeStory()">✖</button>
      </div>
  `;
  document.body.appendChild(overlay);

  document.addEventListener("keydown", handleKeyEvents);
}

function closeStory() {
  const overlay = document.getElementById("story-overlay");
  if (overlay) overlay.remove();
  document.removeEventListener("keydown", handleKeyEvents);
}

function nextStory() {
  if (!currentCollection || currentStoryIndex >= currentCollection.stories.length - 1) {
      closeStory();
      return;
  }
  currentStoryIndex++;
  updateStory();
}

function prevStory() {
  if (!currentCollection || currentStoryIndex <= 0) return;
  currentStoryIndex--;
  updateStory();
}

function updateStory() {
  const video = document.getElementById("story-video");
  if (!video || !currentCollection.stories[currentStoryIndex]) {
      console.error("No video or story available at index:", currentStoryIndex);
      return;
  }
  video.src = currentCollection.stories[currentStoryIndex].url;
  video.play();
}

function handleKeyEvents(event) {
  if (event.key === "Escape") closeStory();
  if (event.key === "ArrowRight") nextStory();
  if (event.key === "ArrowLeft") prevStory();
}

function playStoriesSequentially(stories, index = 0) {
  if (index >= stories.length) {
      closeStory(); // Close modal when all stories are played
      return;
  }

  const story = stories[index];
  if (!story || !story.url) {
      console.error("Invalid story object:", story);
      return;
  }

  const modal = document.createElement('div');
  modal.innerHTML = `
      <div class="story-modal">
          <video src="${story.url}" autoplay controls></video>
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
