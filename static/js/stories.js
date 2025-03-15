document.addEventListener("DOMContentLoaded", async function () {
  try {
      const response = await fetch('/stories.json'); // Load stories.json
      const collections = await response.json(); // Parse JSON

      const storiesArray = collections.map(collection => ({
          id: collection.id,
          photo: collection.image, // Use thumbnail image for avatar
          name: collection.title,
          items: collection.stories.map(story => ({
              id: story.id,
              type: "video",
              length: 10, // Default duration (adjust as needed)
              src: story.video,
              preview: "/images/story-preview.jpg", // Optional preview image
              time: new Date().getTime(), // Timestamp
          }))
      }));

      var stories = new Zuck('stories', {
          skin: "snapgram",
          autoFullScreen: true,
          avatars: true,
          list: false,
          cubeEffect: true,
          backButton: true,
          backNative: false,
          paginationArrows: true,
          stories: storiesArray // Use dynamically loaded stories
      });

  } catch (error) {
      console.error("Error loading stories:", error);
  }
});
