import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Todo List",
    short_name: "Todo List",
    description: "A simple todo list app",
    start_url: "/",
    display: "standalone",
    background_color: "#10121E",
    theme_color: "#10121E",
    icons: [
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "57x57",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "60x60",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "72x72",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "76x76",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "114x114",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "120x120",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "144x144",
      },
      {
        src: "/icon.png",
        type: "image/png",
        sizes: "152x152",
      },
    ],
  };
}
