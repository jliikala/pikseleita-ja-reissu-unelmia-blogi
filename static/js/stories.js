document.addEventListener("DOMContentLoaded", async function () {
  try {
    const response = await fetch('/stories.json');
    if (!response.ok) throw new Error("Failed to load stories.json");

    const collections = await response.json();
    console.log("Fetched JSON data:", collections); // Debugging

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
  } catch (error) {
    console.error("Error loading stories:", error);
  }
});

let currentCollection = null;
let currentStoryIndex = 0;

function openStoryCollection(collectionId) {
  fetch('/stories.json')
      .then(response => {
          if (!response.ok) throw new Error("Failed to load stories.json");
          return response.json();
      })
      .then(collections => {
          console.log("Fetching collection:", collectionId);
          console.log("Available collections:", collections);

          const collection = collections.find(c => c.id === collectionId);
          if (!collection) {
              console.error("Collection not found:", collectionId);
              return;
          }

          currentCollection = collection;
          currentStoryIndex = 0;
          showStory(collection.stories[currentStoryIndex]);
      })
      .catch(error => console.error("Error opening story collection:", error));
}

function showStory(story) {
  const overlay = document.createElement('div');
  overlay.id = 'story-overlay';
  overlay.innerHTML = `
      <div id="story-content">
          <video id="story-video" src="${story.video}" autoplay controls></video>
          <button id="prev-story" onclick="prevStory()">◀</button>
          <button id="next-story" onclick="nextStory()">▶</button>
          <button id="close-story" onclick="closeStory()">✖</button>
      </div>
  `;
  document.body.appendChild(overlay);

  document.addEventListener("keydown", handleKeyEvents);
  addSwipeListeners(); // Add touch swipe detection

  markStoryAsSeen(story.id);
}

function closeStory() {
  const overlay = document.getElementById("story-overlay");
  if (overlay) overlay.remove();
  document.removeEventListener("keydown", handleKeyEvents);
  removeSwipeListeners(); // Remove touch swipe detection
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
  if (!video) return;

  const story = currentCollection.stories[currentStoryIndex];
  video.src = story.video;
  video.play();

  markStoryAsSeen(story.id);
}

function handleKeyEvents(event) {
  if (event.key === "Escape") closeStory();
  if (event.key === "ArrowRight") nextStory();
  if (event.key === "ArrowLeft") prevStory();
}

function markStoryAsSeen(storyId) {
  let seenStories = JSON.parse(localStorage.getItem("seenStories")) || [];
  if (!seenStories.includes(storyId)) {
      seenStories.push(storyId);
      localStorage.setItem("seenStories", JSON.stringify(seenStories));
  }
  updateStoryStyles();
}

function updateStoryStyles() {
  fetch('/stories.json')
      .then(response => {
          if (!response.ok) throw new Error("Failed to load stories.json");
          return response.json();
      })
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
      })
      .catch(error => console.error("Error updating story styles:", error));
}

/* ====================== */
/* 🔥 SWIPE GESTURE LOGIC */
/* ====================== */
let touchStartX = 0;
let touchEndX = 0;

function handleTouchStart(event) {
    touchStartX = event.touches[0].clientX;
}

function handleTouchMove(event) {
    touchEndX = event.touches[0].clientX;
}

function handleTouchEnd() {
    const swipeDistance = touchStartX - touchEndX;

    if (swipeDistance > 50) {
        nextStory(); // Swipe left → Next story
    } else if (swipeDistance < -50) {
        prevStory(); // Swipe right → Previous story
    }
}

function addSwipeListeners() {
    const overlay = document.getElementById("story-overlay");
    overlay.addEventListener("touchstart", handleTouchStart, false);
    overlay.addEventListener("touchmove", handleTouchMove, false);
    overlay.addEventListener("touchend", handleTouchEnd, false);
}

function removeSwipeListeners() {
    const overlay = document.getElementById("story-overlay");
    overlay.removeEventListener("touchstart", handleTouchStart, false);
    overlay.removeEventListener("touchmove", handleTouchMove, false);
    overlay.removeEventListener("touchend", handleTouchEnd, false);
}
