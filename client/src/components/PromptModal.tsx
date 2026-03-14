import { useRef, useEffect } from 'react';
import DrawPrompt from './DrawPrompt';

interface Props { isOpen: boolean; onClose: () => void; promptId?: string; }

const PromptModal = ({ isOpen, onClose, promptId }: Props) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    if (isOpen) {
      modal.showModal();
    } else {
      modal.close();
    }

    const handleClose = () => {
        onClose();
    };
    modal.addEventListener('close', handleClose);

    return () => {
      modal.removeEventListener('close', handleClose);
    };
  }, [isOpen, onClose]);

  return (
    <dialog ref={modalRef} className="m-auto rounded-xl backdrop:bg-black/60 backdrop:backdrop-blur-sm">
      {promptId && <DrawPrompt promptId={promptId} />}
    </dialog>
  );
};

export default PromptModal;