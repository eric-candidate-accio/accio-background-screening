// Hooks
export { useSlots } from "./hooks/use-slots";

// Layout components
export { PageLayout, type PageLayoutProps } from "./components/page-layout";
export { SplitLayout, type SplitLayoutProps } from "./components/split-layout";
export { Header, type HeaderProps } from "./components/header";

// Slot markers
export {
  PageHeader,
  PageSidebar,
  PageAlert,
  PageFooter,
  PageActions,
  SplitLeft,
  SplitRight,
} from "./components/slots";

// Types
export type { SlotDefinition, SlotProps, SlotMap } from "./types";
