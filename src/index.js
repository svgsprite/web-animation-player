
import './index.scss'
import { h, render, Component } from 'preact'

import {
	preventDefaults,
	readFileFromFS,
	initAnimation,
	changeAnimationSpeed,
	destroyAnimation,
	togglePlayback,
	goToFrame
} from './utils'

import demo from './demo'

class App extends Component {

	constructor() {

		super()

		this.controls = {
			byId: {
				renderer: {
					options: ['SVG', 'CANVAS'],
					defValue: 0
				},
				speed:{
					options: [.1, .5, 1, 2, 3],
					defValue: 2
				},
				background: {
					options: ['light', 'darkChess', 'gray', 'chess'],
					defValue: 0
				},
				wireframe: {
					options: [0, 1],
					defValue: 0
				}
			},
			allIds: ['renderer', 'speed', 'background', 'wireframe']
		}

		this.state = {
			isFirstRunning: true,
			content: null
		}

		this.controls.allIds.map(id => {
			this.state[id] = this.controls.byId[id].defValue
		})

		this.animArea = null
		this.animation = null
		this.playbackElements = {}

		this.handleDrag = this.handleDrag.bind(this)
		this.handleDrop = this.handleDrop.bind(this)
		this.handleFile = this.handleFile.bind(this)
		this.handlePlaybackElementsClick = this.handlePlaybackElementsClick.bind(this)

		this.runDemo = this.runDemo.bind(this)
		this.initAnimation = this.initAnimation.bind(this)

	}


	componentDidMount() {

		setTimeout(() => {

			let state = {
				...this.state,
				isFirstRunning: false
			}

			try {

				// Gets the previous state from the local storage of the browser.

				this.controls.allIds.map(id => {
					let prevValue = parseInt(localStorage.getItem(id))
					if(!isNaN(prevValue) && prevValue !== this.state[id]) {
						state[id] = prevValue
					}
				})

				this.setState(state)

			} catch (error) {
				console.warn('Local storage is not available.', error)
				this.setState(state)
			}

		}, 1000)

	}


	// Top and bottom sidebars
	renderSidebar(key, content) {
		return (
			<tr id={key+'Sidebar'}>
				<td className='left'>
					{content.left}
				</td>
				<td className='center'>
					{content.center}
				</td>
				<td className='right'>
					{content.right}
				</td>
			</tr>
		)
	}


	// Animation area
	renderAnimArea() {

		const backgroundOptions = this.controls.byId.background.options
		const background = backgroundOptions[this.state.background]

		return (
			<tr>
				<td colspan='3'>
					<div
						id='animArea'
						className={
							(this.state.content
								? 'animTime '
								: ''
							) + background
						}
						ref={el=>this.animArea = el}
						ondragenter={this.handleDrag}
						ondragover={preventDefaults}
						ondragleave={this.handleDrag}
						ondrop={this.handleDrop}
					>
						<div id='dndHint'>
							<div className='regular'>
								Drop your JSON file to this area
							</div>
							<div className='comment'>
								It works privately, without any uploadings on the server!
							</div>
						</div>

						<div
							ref={el => this.animation = el}
							id='animation'
							onclick={togglePlayback}
							className={this.state.wireframe ? 'wireFrameMode' : ''}
						></div>

						<div
							id='playbackElements'
							ref={el => this.playbackElements.wrap = el}
							onMouseDown={this.handlePlaybackElementsClick}
						>
							<div
								id='playbackProgressBar'
								ref={el => this.playbackElements.progressBar = el}
							>
							</div>

						</div>
					</div>
				</td>
			</tr>
		)

	}


	// Top left corner
	renderOpenFileBtn() {
		return (
			<div className='btn mr' id='importBtn'>
				<div className='mobile inline'>Open</div>
				<div className='tablet inline'>Open a file</div>
				<label for='fileField'></label>
				<input
					id='fileField'
					type='file'
					onchange={e => this.handleFile(e.target.files[0])}
				/>
			</div>
		)
	}


	// Top center area
	renderAnimControls() {
		return (
			<div className='btnSet'>

				<div onclick={()=>this.updateUI('renderer')}>
					<div className='tablet inline'>Renderer: </div>
					<div className='inline bold'>
						{this.controls.byId.renderer.options[this.state.renderer]}
					</div>
				</div>

				<div onclick={()=>this.updateUI('speed')}>
					Speed: <div className='inline bold'>
						{this.controls.byId.speed.options[this.state.speed]}x
					</div>
				</div>

			</div>
		)
	}


	// Top right corner
	renderViewControls() {
		return (
			<div>

				{this.state.renderer === 0 &&
					<div className='btnSet'>
						<div
							className={this.state.wireframe ? 'active' : ''}
							onclick={() => this.updateUI('wireframe') }
						>
							Wf
						</div>
						<div
							onclick={()=>this.updateUI('background')}
						>
							Bg
						</div>
					</div>
				}

				{this.state.renderer === 1 &&
					<div
						className='btn'
						onclick={()=>this.updateUI('background')}
					>
						Bg
					</div>
				}

			</div>
		)
	}


	// Bottom left corner
	renderPrimaryLinks() {
		return (
			<div>

				<a
					className='left inline'
					href='https://cdnjs.com/libraries/bodymovin'
					rel='nofollow'
					target='_blank'
				>
					<div className='mobile inline bold'>CDN</div>
					<div className='tablet inline bold'>Get Latest player</div>
				</a>

				<div className='inline shareList'>
					<div className='tablet inline'>Share: </div>
					<a
						href='https://www.facebook.com/sharer/sharer.php?u=https%3A//svgsprite.com/tools/lottie-player/'
						rel='nofollow'
					>
						FB
					</a>
					<a
						href='https://twitter.com/home?status=https%3A//svgsprite.com/tools/lottie-player/'
						rel='nofollow'
					>
						TW
					</a>
				</div>

			</div>
		)
	}


	// Bottom center area
	renderAnimDemoControls() {
		return (
			<div>
				{!this.state.content &&
					<div onclick={this.runDemo}>
						Run a <div className='btnTxt inline'>Demo</div>
					</div>
				}
				{this.state.content &&
					<div onclick={togglePlayback}>
						<div className='bold inline'>Click</div> to pause
					</div>
				}
			</div>
		)
	}


	// Bottom right corner
	renderSecondaryLinks() {
		return (
			<a
				href='https://github.com/svgsprite/web-animation-player'
				className='inlineBlock'
				target='_blank'
				rel='nofollow'
			>
				<div className='inline bold'>GitHub</div>
			</a>
		)
	}


	// EVENT HANDLERS

	updateUI(id, value, index) {

		let newState
		let controls = this.controls.byId
		let targetControlOptions = controls[id].options
		let callback = id === 'renderer'
			? () => {
				destroyAnimation()
				this.initAnimation()
			}
			: null

		// Switches the value to the next in the control options
		// For example, the speed. This function changes the speed from x1 to x2 and so on.
		value = (this.state[id] + 1) % targetControlOptions.length

		if(id === 'speed') {
			changeAnimationSpeed(targetControlOptions[value])
		}

		newState = {
			...this.state,
			[id]: value
		}

		// Stores value to the local storage of the browser
		window.localStorage.setItem(id, value)

		this.setState(newState, callback)

	}


	handleDrag(e) {
		preventDefaults(e)
		this.animArea.classList.toggle('dropTime')
	}


	handleDrop(e) {

		let dt = e.dataTransfer
		let files = dt.files

		this.animArea.classList.remove('dropTime')
		this.animArea.classList.add('animTime')

		this.handleFile(files[0])
		preventDefaults(e)

	}


	handleFile(file) {

		if(!file) {
			console.warn('There is no files')
			return
		}

		if(this.state.content) {
			destroyAnimation()
		}

		readFileFromFS(
			file,
			data => {
				this.setState(
					{ ...this.state, content: data},
					() => {
						this.initAnimation()
					}
				)
			},
			(err) => {
				alert(err)
			}
		)

	}


	handlePlaybackElementsClick(e) {

		this.isPlayHandleCaptured = true
		this.x = e.clientX

		let maxX = this.playbackElements.wrap.clientWidth
		let minX = 24

		const handleMouseMove = e => {
			if(this.isPlayHandleCaptured) {

				let x = e.clientX < minX
					? minX
					: e.clientX > maxX + minX
						? maxX + minX
						: e.clientX

				goToFrame(e, this.playbackElements, x)
			}
		}

		const handleMouseUp = e => {
			this.isPlayHandleCaptured = false
			document.removeEventListener('mousemove', handleMouseMove, true)
			document.removeEventListener('mouseup', handleMouseUp, true)
		}

		document.addEventListener('mousemove', handleMouseMove, true)
		document.addEventListener('mouseup', handleMouseUp, true)

		goToFrame(e, this.playbackElements)

	}


	runDemo() {

		this.animArea.classList.add('animTime')

		this.setState(
			{ ...this.state, content: demo},
			() => {
				this.initAnimation()
			}
		)

	}


	// OTHER

	// Wrapper of animation initialization function
	initAnimation() {

		initAnimation(
			this.animation,
			this.state.content,
			this.controls.byId.renderer.options[this.state.renderer],
			this.playbackElements
		)

		changeAnimationSpeed(
			this.controls.byId.speed.options[this.state.speed]
		)

	}


    render() {

		const { isFirstRunning, content } = this.state
		const appClassName = content && 'animTime'

		return isFirstRunning
			? null
			: (
			<div id='app' className={appClassName}>
				<table>

					{/*
						🙈 OMG... Tables in 2020?
						Yes, just because it is the most simple and stable solution for most browsers.
					*/}

					{
						this.renderSidebar(
							'top',
							{
								left: this.renderOpenFileBtn(),
								center: this.renderAnimControls(),
								right: this.renderViewControls()
							}
						)
					}

					{
						this.renderAnimArea()
					}

					{
						this.renderSidebar(
							'bottom',
							{
								left: this.renderPrimaryLinks(),
								center: this.renderAnimDemoControls(),
								right: this.renderSecondaryLinks(),
							}
						)
					}

				</table>
			</div>
		)
	}

}


render(<App/>, document.body)