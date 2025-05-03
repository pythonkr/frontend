export const useEmail = () => {
  const sendEmail = () => {
    const email = "pyconkr@pycon.kr";
    const subject = "파이콘 한국 문의";
    const body = "";

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return { sendEmail };
};
