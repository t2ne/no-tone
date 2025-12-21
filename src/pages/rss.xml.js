import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../consts";

export async function GET(context) {
  const pages = [
    {
      title: "empty",
      description: "Empty page",
      link: "/empty/",
      pubDate: new Date(),
    },
    {
      title: "thoughts",
      description: "Thoughts page",
      link: "/thoughts/",
      pubDate: new Date(),
    },
    {
      title: "usr",
      description: "Usr page",
      link: "/usr/",
      pubDate: new Date(),
    },
  ];
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    items: pages,
  });
}
