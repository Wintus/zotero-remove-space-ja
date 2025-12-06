/**
 * Reader module for annotation UI modifications.
 *
 * This module adds a "Remove Space" button to PDF annotation headers
 * in the Zotero PDF reader sidebar.
 */

import { removeSpaces, hasRemovableSpaces } from "../utils/textProcessor";
import { getString } from "../utils/locale";
import { FluentMessageId } from "../../typings/i10n";

/**
 * Register reader event listeners.
 *
 * This function should be called during plugin startup to register
 * event listeners for PDF reader annotation rendering.
 */
export const registerReaderEventListeners = () => {
  // Register event listener for annotation header rendering
  Zotero.Reader.registerEventListener(
    "renderSidebarAnnotationHeader",
    onAnnotationHeaderRender,
    addon.data.config.addonID,
  );
};

/**
 * Handle annotation header rendering event.
 *
 * This callback is triggered when an annotation header is rendered in
 * the PDF reader sidebar. We inject a "Remove Space" button here.
 *
 * @param event - The render event containing reader, doc, params, and append function
 */
const onAnnotationHeaderRender = (event: {
  reader: _ZoteroTypes.ReaderInstance;
  doc: Document;
  params: any;
  append: (elem: HTMLElement) => void;
}): void => {
  const { doc, params, append } = event;

  // Get annotation data from params
  const annotation = params?.annotation;
  if (!annotation) {
    return;
  }

  // Only show button for highlight/underline annotations with text
  const annotationText = annotation.text ?? "";
  if (!annotationText) {
    return;
  }

  // Check if the text has any removable spaces
  if (!hasRemovableSpaces(annotationText)) {
    return;
  }

  // Create the "Remove Space" button
  const button = ztoolkit.UI.createElement(doc, "button", {
    namespace: "html",
    classList: ["remove-space-button"],
    attributes: {
      title: getString("button-remove-space-tooltip"),
      type: "button",
    },
    properties: {
      textContent: getString("button-remove-space"),
    },
    listeners: [
      {
        type: "click",
        listener: (e: Event) => {
          e.stopPropagation();
          handleRemoveSpaceClick(
            annotation,
            button satisfies HTMLButtonElement,
          );
        },
      },
    ],
    styles: {
      marginLeft: "8px",
      padding: "2px 8px",
      fontSize: "12px",
      cursor: "pointer",
    },
  }) satisfies HTMLButtonElement;

  // Append button to the annotation header
  append(button);
};

/**
 * Handle click event on the "Remove Space" button.
 *
 * This function processes the annotation text, removes spaces,
 * updates the annotation, and provides user feedback.
 *
 * @param annotation - The annotation object to modify
 * @param button - The button element that was clicked
 */
const handleRemoveSpaceClick = async (
  annotation: any,
  button: HTMLButtonElement,
): Promise<void> => {
  try {
    // Disable button during processing
    button.disabled = true;
    button.textContent = getString("button-processing");

    // Get the current annotation text
    const originalText = annotation.text ?? "";

    // Remove spaces
    const processedText = removeSpaces(originalText);

    // Check if anything actually changed
    if (processedText === originalText) {
      showFeedback("message-no-changes");
      return;
    }

    // Update the annotation text
    annotation.text = processedText;

    // Save the annotation
    // Note: The exact API for saving might vary; this is based on common patterns
    await annotation?.save?.();

    // Show success feedback
    showFeedback("message-success");

    // Hide the button since there are no more spaces to remove
    button.style.display = "none";
  } catch (error) {
    ztoolkit.log("Error removing spaces from annotation:", error);
    showFeedback("message-error");
  } finally {
    // Re-enable button and restore text
    button.disabled = false;
    button.textContent = getString("button-remove-space");
  }
};

/**
 * Show feedback message to the user using a progress window.
 *
 * @param messageKey - The locale string key for the message
 */
const showFeedback = (messageKey: FluentMessageId): void => {
  new ztoolkit.ProgressWindow(addon.data.config.addonName, {
    closeOnClick: true,
    closeTime: 2000,
  })
    .createLine({
      text: getString(messageKey),
      type: messageKey.includes("success") ? "success" : "default",
      progress: 100,
    })
    .show();
};
