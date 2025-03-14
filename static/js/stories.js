document.addEventListener("DOMContentLoaded", async function () {
  const response = await fetch('/stories.json');
  const stories = await response.json();
  const container = document.getElementById('stories-container');

  if (!container) return;

  stories.forEach(story => {
      const storyElement = document.createElement('div');
      storyElement.innerHTML = `
          <img src="${story.image}" alt="${story.title}" class="story-thumbnail" onclick="openStory('${story.video}')">
      `;
      container.appendChild(storyElement);
  });
});

function openStory(videoUrl) {
  const modal = document.createElement('div');
  modal.innerHTML = `
      <div class="story-modal">
          <video src="${videoUrl}" autoplay controls></video>
          <button onclick="closeStory()">Close</button>
      </div>
  `;
  document.body.appendChild(modal);
}

function closeStory() {
  document.querySelector('.story-modal').remove();
}