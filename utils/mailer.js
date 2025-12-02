/**
 * Mailer vaqtincha o‘chirilgan
 * sendVerificationEmail endi faqat console.log qiladi
 */

export const sendVerificationEmail = async (email, code) => {
  console.log(`Verification code for ${email}: ${code}`);
};

export default { sendVerificationEmail };
