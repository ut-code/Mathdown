export function MdModify(text: string, title: any) {
  const sections = text.split("##");
  sections.shift();
  const modifiedSections =
    sections !== undefined
      ? sections.map((item: string | null | undefined) => {
          const titleAndContent = (item ?? "").split("\n");
          const title = titleAndContent[0].trim();
          const content = "## " + titleAndContent.slice(0).join("\n").trim();
          return { title, content };
        })
      : [];

  const learnSection = modifiedSections.find((item) => item.title === title);
  const learnContent = learnSection ? learnSection.content : "";
  return learnContent;
}

export function SectionList(text: string) {
  const sections = text.split("##");
  sections.shift();
  const modifiedSections =
    sections !== undefined
      ? sections.map((item: string | null | undefined) => {
          const titleAndContent = (item ?? "").split("\n");
          const title = titleAndContent[0].trim();
          return title;
        })
      : [];

  return modifiedSections;
}
