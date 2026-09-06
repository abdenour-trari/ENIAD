function Sidebar() {
  return (
    <div className="w-80 bg-white shadow p-5">
      <h2 className="text-xl font-semibold mb-4">📊 Motor Patterns</h2>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span>Point</span>
          <span id="pointScore">0%</span>
        </div>

        <div className="flex justify-between">
          <span>Select</span>
          <span id="selectScore">0%</span>
        </div>

        <div className="flex justify-between">
          <span>Precision</span>
          <span id="precisionScore">0%</span>
        </div>
      </div>

      <div id="encouragementBox" className="mt-6 bg-green-100 p-3 rounded">
        ⭐ Waiting AI encouragement...
      </div>
    </div>
  );
}

export default Sidebar;
