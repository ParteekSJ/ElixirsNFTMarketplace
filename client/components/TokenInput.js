function TokenInput({ value, setValue, id, placeholder }) {
  return (
    <input
      className="mb-[20px] mt-[5px] outline-none bg-[#16151C] rounded-lg py-[12px] px-[20px] text-white transition-all duration-100 ease-out w-full placeholder:text-white/40 placeholder:font-thin"
      autoComplete="none"
      id={id}
      value={value}
      placeholder={placeholder}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

export default TokenInput;
