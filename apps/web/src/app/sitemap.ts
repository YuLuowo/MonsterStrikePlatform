import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://ms.imagineyuluo.com",
            lastModified: new Date(),
        },
    ];
}