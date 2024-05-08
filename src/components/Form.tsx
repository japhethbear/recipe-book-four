import React from "react";

interface FormProps {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  loading: boolean;
  error: string | null;
}

const Form: React.FC<FormProps> = ({ handleSubmit, loading, error }) => {
  return (
    <div className="flex flex-col justify-items-center align-items">
      <form
        onSubmit={handleSubmit}
        className="form-control justify-items-center mx-10"
      >
        <input
          type="text"
          id="url"
          name="url"
          placeholder="URL here"
          className="input w-full sm:max-w-sm md:max-w-md lg:max-w-full input-bordered"
        />
        <label htmlFor="url"></label>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-info mt-3 sm:max-w-sm md:max-w-md lg:max-w-full"
        >
          {loading ? "Loading..." : "Scrape Recipe"}
        </button>
      </form>
      {error && (
        <p className="text-error mx-10 mt-4 sm:max-w-sm md:max-w-md lg:max-w-full">
          {error}
        </p>
      )}
    </div>
  );
};

export default Form;
