// Centered max-w-md wrapper for auth / form pages
const FormContainer = ({ children, maxWidth = 'max-w-md' }) => (
  <div className={`mx-auto w-full ${maxWidth} px-4 py-14`}>{children}</div>
);

export default FormContainer;
