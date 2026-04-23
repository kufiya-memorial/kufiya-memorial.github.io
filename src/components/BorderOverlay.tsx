function TripleStripe() {
  return (
    <>
      <div className="w-full h-[2px] bg-black" />
      <div className="w-full h-[2px] bg-white" />
      <div className="w-full h-[5px] bg-black" />
      <div className="w-full h-[2px] bg-white" />
      <div className="w-full h-[2px] bg-black" />
    </>
  )
}

export function BorderOverlay() {
  return (
    <div className="fixed bottom-0 left-0 w-full pointer-events-none" style={{ zIndex: 3 }}>
      {/* Triple stripe between pips area and leaves */}
      <TripleStripe />

      {/* Olive leaf pattern — tiles the leaves.png image horizontally */}
      <div
        className="w-full bg-white"
        style={{
          height: '80px',
          backgroundImage: 'url("/leaves.png")',
          backgroundRepeat: 'repeat-x',
          backgroundSize: 'auto 100%',
          backgroundPosition: 'center',
        }}
      />

      {/* Single line at the very bottom */}
      <div className="w-full h-[3px] bg-black" />
    </div>
  )
}
