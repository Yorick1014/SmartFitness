import React, { useRef } from "react";
import * as Modal from "@radix-ui/react-dialog";

export default function Dialog({ title, onCancel, children }) {
  const trigger = useRef(document.activeElement);
  return (
    <Modal.Root
      open
      onOpenChange={(open) => {
        if (!open) onCancel();
      }}
    >
      <Modal.Portal>
        <Modal.Overlay className="ui-dialog-overlay" />
        <Modal.Content
          className="card modal ui-dialog"
          aria-describedby={undefined}
          onInteractOutside={(event) => event.preventDefault()}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (trigger.current?.isConnected) trigger.current.focus();
          }}
        >
          <Modal.Title asChild>
            <h2>{title}</h2>
          </Modal.Title>
          {children}
        </Modal.Content>
      </Modal.Portal>
    </Modal.Root>
  );
}
