/**
 * Shared header (title only, no buttons) and bottom border
 * used on landing, onboarding, and stats screens.
 */
export function PageChrome() {
  return (
    <>
      {/* Header bar — title only */}
      <div className="fixed top-0 left-0 w-full bg-white flex flex-col" style={{ zIndex: 11 }}>
        <div className="flex items-center px-5 h-14">
          <h1 className="text-base font-semibold tracking-tight text-black">
            Kufiya Memorial
          </h1>
        </div>
        <div className="w-full h-[2px] bg-black" />
        <div className="w-full h-[2px] bg-white" />
        <div className="w-full h-[5px] bg-black" />
        <div className="w-full h-[2px] bg-white" />
        <div className="w-full h-[2px] bg-black" />
      </div>

      {/* Bottom border */}
      <div className="fixed bottom-0 left-0 w-full" style={{ zIndex: 11 }}>
        <div className="w-full h-[2px] bg-black" />
        <div className="w-full h-[2px] bg-white" />
        <div className="w-full h-[5px] bg-black" />
        <div className="w-full h-[2px] bg-white" />
        <div className="w-full h-[2px] bg-black" />

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

        <div className="w-full h-[3px] bg-black" />
      </div>
    </>
  )
}
