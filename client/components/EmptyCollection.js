export default function EmptyCollection({ title }) {
  return (
    <div className="flex items-center justify-center mx-9 my-6 bg-black/20 py-5 px-3 rounded-lg">
      <div className="flex flex-col text-center md:flex-row space-x-2">
        <span className="text-[26px]">{title}</span>
      </div>
    </div>
  );
}
