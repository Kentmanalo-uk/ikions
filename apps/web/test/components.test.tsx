import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Explorer } from "@/components/explorer/explorer";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { CopyButton } from "@/components/ui/copy-button";
import { Segmented } from "@/components/ui/segmented";
import { CodeTabs } from "@/components/workbench/code-tabs";
import { iconNodes } from "@ikions/icons";
import { categories, collections, icons, synonyms, version } from "@ikions/metadata";
import { beforeEach } from "vitest";
import { buildClientCatalog, primeClientCatalog, type CatalogPayload } from "@/lib/client-catalog";

// The explorer normally fetches /data/catalog.json; tests provide it directly.
const testCatalog = buildClientCatalog({ version, categories, collections, synonyms, icons, nodes: iconNodes as unknown as CatalogPayload["nodes"] });
const initial = { icons: [], categories: testCatalog.categories, total: icons.length };
beforeEach(() => primeClientCatalog(testCatalog));
import { DEFAULT_OPTIONS } from "@/lib/snippets";

const setSearchParams = (query: string) => window.history.replaceState(null, "", `/icons${query ? `?${query}` : ""}`);

const tiles = () => [...screen.getByRole("list", { name: "Icons" }).querySelectorAll<HTMLElement>("[data-icon]")];

describe("Segmented", () => {
  it("changes value with clicks and arrow keys", async () => {
    const onChange = vi.fn();
    render(
      <Segmented
        label="Variant"
        value="outline"
        onChange={onChange}
        options={[
          { value: "outline", label: "Outline" },
          { value: "filled", label: "Filled" },
        ]}
      />,
    );
    const outline = screen.getByRole("radio", { name: "Outline" });
    expect(outline).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByRole("radio", { name: "Filled" }));
    expect(onChange).toHaveBeenLastCalledWith("filled");
    fireEvent.keyDown(outline, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("filled");
  });
});

describe("CopyButton", () => {
  it("copies text and reports success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { clipboard: { writeText } });
    render(<CopyButton text="<svg/>" label="Copy SVG" />);
    await userEvent.click(screen.getByRole("button", { name: "Copy SVG" }));
    expect(writeText).toHaveBeenCalledWith("<svg/>");
    expect(await screen.findByText("Copied")).toBeInTheDocument();
  });

  it("reports failures", async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("denied")) } });
    render(<CopyButton text="x" label="Copy name" />);
    await userEvent.click(screen.getByRole("button", { name: "Copy name" }));
    expect(await screen.findByText("Copy failed")).toBeInTheDocument();
  });
});

describe("ThemeToggle", () => {
  it("switches the document theme and stores the preference", async () => {
    document.documentElement.dataset.theme = "light";
    render(<ThemeToggle />);
    await userEvent.click(screen.getByRole("button", { name: "Switch to dark theme" }));
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("ikions:theme")).toBe("dark");
    expect(screen.getByRole("button", { name: "Switch to light theme" })).toBeInTheDocument();
  });
});

describe("CodeTabs", () => {
  it("shows a snippet per tab for the selected variant", async () => {
    render(
      <CodeTabs icon={{ name: "camera", title: "Camera", component: "CameraIcon" }} nodes={iconNodes.camera} options={{ ...DEFAULT_OPTIONS, variant: "filled" }} />,
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent('fill="currentColor"');
    await userEvent.click(screen.getByRole("tab", { name: "React" }));
    expect(screen.getByRole("tabpanel")).toHaveTextContent('<CameraIcon variant="filled" />');
    fireEvent.keyDown(screen.getByRole("tab", { name: "React" }), { key: "ArrowRight" });
    expect(screen.getByRole("tab", { name: "Vue" })).toHaveAttribute("aria-selected", "true");
  });
});

describe("Explorer", () => {
  it("searches by name and alias", async () => {
    setSearchParams("");
    render(<Explorer initial={initial} />);
    const search = screen.getByRole("searchbox", { name: "Search icons" });
    await userEvent.type(search, "delete");
    expect(tiles()[0]).toHaveAttribute("data-icon", "trash");
  });

  it("filters by category from the sidebar", async () => {
    setSearchParams("");
    render(<Explorer initial={initial} />);
    await userEvent.click(screen.getByRole("button", { name: /Finance & Business/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Finance & Business");
    expect(tiles().map((t) => t.dataset.icon)).toContain("wallet");
    expect(tiles().map((t) => t.dataset.icon)).not.toContain("home");
  });

  it("reads initial state from the URL and opens the inspector", () => {
    setSearchParams("q=camera&variant=filled&icon=camera");
    render(<Explorer initial={initial} />);
    expect(screen.getByRole("searchbox", { name: "Search icons" })).toHaveValue("camera");
    expect(screen.getByRole("radiogroup", { name: "Icon variant" }).querySelector('[aria-checked="true"]')).toHaveTextContent("Filled");
    expect(screen.getByRole("complementary", { name: "Camera inspector" })).toBeInTheDocument();
  });

  it("selects icons and shows the export toolbar", async () => {
    setSearchParams("q=home");
    render(<Explorer initial={initial} />);
    await userEvent.click(screen.getByRole("button", { name: "Add Home to selection" }));
    const bar = screen.getByRole("region", { name: "Selected icons" });
    expect(bar).toHaveTextContent("1");
    expect(within(bar).getByRole("button", { name: "Download ZIP" })).toBeEnabled();
    await userEvent.click(within(bar).getByRole("button", { name: "Clear selection" }));
    expect(screen.queryByRole("region", { name: "Selected icons" })).not.toBeInTheDocument();
  });

  it("stores favourites locally", async () => {
    setSearchParams("q=star&icon=star");
    render(<Explorer initial={initial} />);
    await userEvent.click(screen.getByRole("button", { name: "Add Star to favourites" }));
    expect(JSON.parse(localStorage.getItem("ikions:favorites")!)).toEqual(["star"]);
    await act(async () => {
      await userEvent.click(screen.getByRole("button", { name: /^Favourites/ }));
    });
    expect(tiles().map((t) => t.dataset.icon)).toEqual(["star"]);
  });
});
