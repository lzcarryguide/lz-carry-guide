LAST Z PILOT WEBSITE STARTER
============================

FILES
-----
index.html       Home page
guides.html      Guide category directory
beginner.html    Beginner guide category
research.html    Research & progression category
heroes.html      Heroes, troops & power category
events.html      Events & rewards category
pilot.html       Service packages and Discord contact
style.css       Shared design for all pages

EDITING ON GITHUB (BROWSER ONLY)
--------------------------------
1. Create a PUBLIC repository named: last-z-pilot-site
2. Upload all files from this folder into the repository root.
   Keep index.html and style.css at the top level, not inside another folder.
3. Open each HTML file on GitHub and click the pencil/edit icon to change text.
4. Replace the Discord placeholder link in pilot.html with your real Discord profile or invite URL.
5. Add YouTube videos to the relevant category pages. The current video boxes are placeholders.

PUBLISH WITH GITHUB PAGES
-------------------------
1. In the repository, open Settings.
2. Open Pages.
3. Under Build and deployment, choose Deploy from a branch.
4. Choose branch main and folder /(root), then Save.
5. Wait for the deployment to complete. Your public URL will appear in Settings > Pages.

ADDING A YOUTUBE VIDEO
----------------------
On YouTube, open your video and select Share > Embed.
Copy the iframe embed code. In the relevant HTML page, replace one
<div class="video-placeholder"> ... </div> block with the iframe.
For a responsive embed, you can wrap it like this:

<div style="aspect-ratio:16/9">
  <iframe
    src="https://www.youtube.com/embed/VIDEO_ID"
    title="Video title"
    style="width:100%;height:100%;border:0;border-radius:12px"
    allowfullscreen
    loading="lazy">
  </iframe>
</div>

Replace VIDEO_ID with the ID of your own YouTube video.

IMPORTANT
---------
- This starter is a static website; it does not process bookings or payments automatically.
- Replace all placeholder content and confirm all package details before promoting the site.
- Public pages can be viewed by anyone; do not put private client information in them.
- Use only Discord links you control and test them before publishing.
- Check the game's rules before offering account access or piloting services.
