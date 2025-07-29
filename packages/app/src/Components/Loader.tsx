import loaderImg from "../Assets/Loader.json"
import Lottie from "react-lottie";

const Loader = () => {
    const loaderOptions = {
        loop: true,
        autoplay: true,
        animationData: loaderImg,
        rendererSettings: {
          preserveAspectRatio: "xMidYMid slice",
        },
      };

  return (
    <div className='z-20 fixed w-full h-full bg-[#0c192a84] flex  justify-center items-center'>
        <div className='h-2/5 w-2/5'>
          <Lottie options={loaderOptions} />
        </div>
    </div>
  )
}

export default Loader