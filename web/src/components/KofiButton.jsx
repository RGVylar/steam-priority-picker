export function KofiButton() {
  return (
    <a 
      href="https://ko-fi.com/Z8Z81OW7UV" 
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-16 right-4 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-lg transition-all font-medium text-sm shadow-lg hover:shadow-xl z-40"
      title="Buy me a beer on Ko-fi"
    >
      <span>🍺</span>
      <span>Buy me beer</span>
    </a>
  )
}

export default KofiButton
