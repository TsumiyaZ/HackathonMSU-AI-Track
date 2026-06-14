import tailwindPostCSS from "@tailwindcss/postcss";
import postcss from "postcss";
import fs from "fs";

const css = fs.readFileSync("app/globals.css", "utf8");

const result = await postcss([tailwindPostCSS()]).process(css, {
  from: "app/globals.css",
});

fs.writeFileSync("app/globals.generated.css", result.css);
console.log(`Generated globals.generated.css (${result.css.length} bytes)`);
