
import lottie from './lottie-web'


function preventDefaults(e) {
	e.preventDefault()
	e.stopPropagation()
}


function cancelBubble(event){
    var e = event || window.event
    if(typeof e.stopPropagation !== 'undefined') {
		e.stopPropagation()
	} else {
    	e.cancelBubble = true
		e.preventDefault()
	}
}


function readFileFromFS(file, onSuccess, onError) {

	if(!file) return

	const reader = new FileReader()

	const f = splitFileNameAndExt(file.name)
	const fileName = f[0]
	const ext = f[1]

	reader.onerror = () => {
		if(onError) onError(file.name)
	}

	reader.onabort = function(e) {
		// File reading cancelled
		if(onError) onError(file.name)
	}

	reader.onloadstart = function(e) {
		// File reading started
	}

	reader.onload = function(e) {

		switch(ext){

			case 'json':
				onSuccess(JSON.parse(reader.result))
				break

			default:
				if(onError) onError('It is not a JSON file')
				return
		}
	}

	reader.readAsText(file)

}


function splitFileNameAndExt(str) {
    if(!str) return false
    let lastDotIndex = str.lastIndexOf('.')
    return [str.substr(0, lastDotIndex), str.substr(lastDotIndex+1)]
}


function initAnimation(container, content, renderer, playbackElements){

	window.lottie = lottie

	window.lottieCycle = (data) => {
		let handlePos = (data.currentFrame / data.totalFrames * 100) +'%'
		playbackElements.progressBar.style.width = handlePos
	}

	window.lottieAnim = lottie.loadAnimation({
		container: container,
		renderer: renderer.toLowerCase(),
		loop: true,
		autoplay: true,
		animationData: content,
		// rendererSettings: {
		// 	scaleMode: 'noScale',
		// 	clearCanvas: false,
		// 	progressiveLoad: false,
		// 	hideOnTransparent: true
		// }
	})

	// console.log(window.lottieAnim)

}

function changeAnimationSpeed(value) {
	lottie.setSpeed(value)
}


function destroyAnimation() {
	lottie.destroy()
}


function togglePlayback() {
	lottie.togglePause()
}


function goToFrame(e, playbackElements, x) {
	cancelBubble(e)
	if(window.lottieAnim) {
		let handlePos = ((x || e.clientX) - 24) / (playbackElements.wrap.clientWidth)
		let targetFrame = window.lottieAnim.totalFrames * handlePos
		lottie.goToAndStop(targetFrame, true)
	}
}


export {
	preventDefaults,
	cancelBubble,
	readFileFromFS,
	splitFileNameAndExt,
	initAnimation,
	changeAnimationSpeed,
	destroyAnimation,
	togglePlayback,
	goToFrame
}