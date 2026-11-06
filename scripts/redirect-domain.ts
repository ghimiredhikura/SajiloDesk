// Only the www hostname and plain-HTTP apex route invoke this Worker.
// The HTTPS site itself is served entirely as static assets.
export default {
  fetch(request: Request): Response {
    const destination = new URL(request.url);
    destination.protocol = 'https:';
    destination.hostname = 'sajilodesk.com';
    destination.port = '';
    return Response.redirect(destination.href, 301);
  },
};
