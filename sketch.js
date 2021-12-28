class PhysicsWorld{
  G = 6 // 6.67e-11 is too small! and floating-point errors are not cool
  objects = []

  gravity_force(m1, m2, r){
    return p5.Vector.normalize(r).mult(this.G*m1*m2/(r.magSq()))
  }

  addObject(obj){
    this.objects.push(obj)
    obj.world = this
  }
  removeAllObjects(){
    this.objects = []
  }

  drawLinesBetweenObjects(){
    let prevObj, firstObj

    for(let obj of this.objects){
      if(!prevObj){
        prevObj = obj
        firstObj = obj
      } else {
        line(prevObj.pos.x, prevObj.pos.y, obj.pos.x, obj.pos.y);
        prevObj = obj
      }
    }
    line(prevObj.pos.x, prevObj.pos.y, firstObj.pos.x, firstObj.pos.y);
  }

  render(){
    for(let obj of this.objects){
      obj.update(deltaTime / 1000)
    }
  }
}

class PhysicsObject{
  constructor(name, pos, radius, shape, color, mass, velocity, fixed){
    pos.add(windowWidth / 2, windowHeight / 2, 0) // put them in the center
	  this.name = name
    this.pos = pos || createVector(0,0,0)
    this.radius = radius || 1
    this.shape = shape
    this.color = color
    this.mass = mass || 1
    this.vel = velocity
    this.acc = createVector(0,0,0)
    this.net_force = createVector(0,0,0)
    this.fixed = fixed || false
  }
  getPos(){
    return p5.Vector.sub(this.pos, createVector(windowWidth / 2, windowHeight / 2, 0))
  }
  distance_vector(obj1, obj2){
    return p5.Vector.sub(obj2.pos, obj1.pos)
  }
  calculate_forces(){
    let f = createVector(0,0,0)
    const others = this.world.objects.filter(obj => obj.name !== this.name)
    for(let obj of others){
      let force = this.world.gravity_force(this.mass, obj.mass, this.distance_vector(this, obj))
      f.add(force)
    }
    this.net_force = f
  }
  update_acceleration(){
    this.acc = p5.Vector.div(this.net_force, this.mass)
  }
  update_velocity(dt){
    this.vel.add(p5.Vector.mult(this.acc, dt))
  }
  update_pos(dt){
    this.pos.add(p5.Vector.mult(this.vel, dt))
  }
  add_velocity(velocity){
    this.vel = velocity
  }
  update(dt){
    this.calculate_forces()
    this.update_acceleration()
    this.update_velocity(dt)
    this.update_pos(dt)

    fill(this.color)
    this.shape(this.pos.x, this.pos.y, this.radius)
  }
  
}

function buildPolygon(r, n){
  const phi = 360 / n
  const m_i = mass / (n-1)

  for(let i = 0; i <= n-1; i++){
    const xPos = r * cos(phi*i)
    const yPos = r * sin(phi*i)

    const po =new PhysicsObject(`vertex${i}`, createVector(xPos, yPos, 0), 10, circle, color(0, 0, 0), m_i, createVector(0,0,0))
    WORLD.addObject(po)
  }
}

var mass = 3000
let slider;
var WORLD;
var sliderValue = 0;

function setOrbitalVelocities(r){

  // sum = 0
  // for(let i = 1; i < WORLD.objects.length - 1;i++){
  //     sum += 1/sin(i*180/sliderValue)
  // }

  for(let obj of WORLD.objects){
    obj.calculate_forces()
    // const velocity_magnitude = WORLD.G*obj.mass*1/4*1/r*1/(sliderValue - 1)*sum
    const velocity_magnitude = sqrt(obj.net_force.mag() * r / obj.mass)

    const v0 = obj.getPos().copy()
    v0.normalize()
    v0.rotate(90)
    v0.mult(velocity_magnitude)
    obj.add_velocity(v0)
  }
}
function setup() {
  createCanvas(windowWidth, windowHeight);
  angleMode(DEGREES);
  textSize(32);
  strokeWeight(2)

  button = createButton('Change to Sun Earth configuration');
  button.position(0, 0);
  button.mousePressed(setupSunEarth);

  button = createButton('Change to Polygon configuration');
  button.position(0, 50);
  button.mousePressed(setupPolygon);
  WORLD = new PhysicsWorld()

  if(sunEarthModel){
    setupSunEarth()
  }else{
    setupPolygon()
  }
}

var r = 300
var sunEarthModel = false

function setupPolygon(){
  sunEarthModel = false
  WORLD.removeAllObjects()
  slider = createSlider(1, 500, 10, 1);
  slider.position(50, 80);
  slider.style('width', '500px');

  buildPolygon(r, sliderValue)
  setOrbitalVelocities(r)
}
function setupSunEarth(){
  sunEarthModel = true
  slider.remove()
  WORLD.removeAllObjects()

  const po = new PhysicsObject(`sun`, createVector(0, 0, 0), 30, circle, color(255, 155, 0), 900989, createVector(0,0,0))
  WORLD.addObject(po)

  const po1 = new PhysicsObject(`planet`, createVector(300, 0, 0), 10, circle, color(0, 0, 255), 5972, createVector(0,0,0))
  WORLD.addObject(po1)

  setOrbitalVelocities(r)
}

function draw() {
  background(220);

  // reference circle
  fill(220)
  stroke(color(155, 155, 155))
  circle(windowWidth / 2, windowHeight / 2, r * 2)

  fill(0)
  stroke(0)

  if(sunEarthModel == false){
    let newSliderValue = slider.value()
    stroke(0);
    fill(0)
    text(`${newSliderValue}`, 10, 100);
  
    if(newSliderValue != sliderValue){
      WORLD.removeAllObjects()
      sliderValue = newSliderValue
      buildPolygon(r, sliderValue)
      setOrbitalVelocities(r)
    }

  }
  WORLD.render()
  WORLD.drawLinesBetweenObjects()
  
}

