export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.hostname === "www.yorudan.com" || url.protocol === "http:") {
      url.hostname = "yorudan.com";
      url.protocol = "https:";
      return Response.redirect(url.toString(), 308);
    }
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
    }
    const upstream = new URL("https://mooonbread.github.io");
    upstream.pathname = "/yorudan" + url.pathname;
    const response = await fetch(upstream, { method: request.method, redirect: "manual" });
    const headers = new Headers(response.headers);
    const location = headers.get("location");
    if (location) {
      const target = new URL(location, upstream);
      if (target.origin === upstream.origin && target.pathname.startsWith("/yorudan/")) {
        target.hostname = "yorudan.com";
        target.pathname = target.pathname.slice("/yorudan".length);
        headers.set("location", target.toString());
      }
    }
    headers.set("Cache-Control", "public, max-age=0, must-revalidate");
    return new Response(response.body, { status: response.status, headers });
  }
};
