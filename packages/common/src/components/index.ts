import { CenteredPage as CenteredPageComponent } from "./centered_page";
import { CommonContextProvider as CommonContextProviderComponent } from "./common_context";
import { DndFileInput as DndFileInputComponent } from "./dnd_file_input";
import { ErrorFallback as ErrorFallbackComponent } from "./error_handler";
import { FallbackImage as FallbackImageComponent } from "./fallback_image";
import { LinkHandler as LinkHandlerComponent } from "./link_handler";
import {
  LottieDebugPanel as LottieDebugPanelComponent,
  LottiePlayer as LottiePlayerComponent,
  NetworkLottiePlayer as NetworkLottiePlayerComponent,
} from "./lottie";
import { MarkdownEditor as MarkdownEditorComponent } from "./md_editor";
import { MDXRenderer as MDXRendererComponent } from "./mdx";
import { Confetti as ConfettiComponent } from "./mdx_components/confetti";
import {
  FAQAccordion as FAQAccordionComponent,
  type FAQAccordionProps as FAQAccordionPropsType,
  type FAQItem as FAQItemType,
} from "./mdx_components/faq_accordion";
import type { MapPropType as MapComponentPropType } from "./mdx_components/map";
import { Map as MapComponent } from "./mdx_components/map";
import { OneDetailsOpener as OneDetailsOpenerComponent } from "./mdx_components/one_details_opener";
import { SessionList as SessionListComponent } from "./mdx_components/session_list";
import {
  PrimaryStyledDetails as PrimaryStyledDetailsComponent,
  HighlightedStyledDetails as SecondaryStyledDetailsComponent,
} from "./mdx_components/styled_details";
import { StyledFullWidthButton as StyledFullWidthButtonComponent } from "./mdx_components/styled_full_width_button";
import { MDXEditor as MDXEditorComponent } from "./mdx_editor";
import { PythonKorea as PythonKoreaComponent } from "./pythonkorea";

namespace Components {
  export const CenteredPage = CenteredPageComponent;
  export const CommonContextProvider = CommonContextProviderComponent;
  export const MarkdownEditor = MarkdownEditorComponent;
  export const MDXEditor = MDXEditorComponent;
  export const MDXRenderer = MDXRendererComponent;
  export const PythonKorea = PythonKoreaComponent;
  export const LottieDebugPanel = LottieDebugPanelComponent;
  export const LottiePlayer = LottiePlayerComponent;
  export const NetworkLottiePlayer = NetworkLottiePlayerComponent;
  export const ErrorFallback = ErrorFallbackComponent;
  export const FallbackImage = FallbackImageComponent;
  export const LinkHandler = LinkHandlerComponent;
  export const DndFileInput = DndFileInputComponent;

  export namespace MDX {
    export const Confetti = ConfettiComponent;
    export const StyledFullWidthButton = StyledFullWidthButtonComponent;
    export const PrimaryStyledDetails = PrimaryStyledDetailsComponent;
    export const SecondaryStyledDetails = SecondaryStyledDetailsComponent;
    export const Map = MapComponent;
    export const FAQAccordion = FAQAccordionComponent;
    export const OneDetailsOpener = OneDetailsOpenerComponent;
    export const SessionList = SessionListComponent;
    export type MapPropType = MapComponentPropType;
    export type FAQAccordionProps = FAQAccordionPropsType;
    export type FAQItem = FAQItemType;
  }
}

export default Components;
