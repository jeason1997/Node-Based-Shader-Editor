function ObjectController(obj, options) {
    this._constructor(obj, options);
}

ObjectController.prototype._constructor = function (obj, options) {
    this._obj = obj;
    this._rotation_speed = options && options.rotation_speed || 10.0;
    this._move_speed = options && options.move_speed || 20.0;
    this._zoom_speed = options && options.move_speed || 10.0;
}

ObjectController.prototype.move = function (v) {
    obj.move(v);
}

ObjectController.prototype.rotate = function (angle_in_deg, axis) {
    obj.rotate(angle_in_deg, axis);
}

function CameraController(obj, options) {
    this._constructor(obj, options);
    this._delta_threshold = 1.0;
}
extendClass(CameraController, ObjectController);

CameraController.prototype.orbit = function (angle_in_deg, axis, center) {
    this._obj.orbit(angle_in_deg, axis, center);
}

CameraController.prototype.orbitDistanceFactor = function (f, center) {
    this._obj.orbit(f, center);
}

CameraController.prototype.handleMouseWheel = function (e) {
    this._obj.orbitDistanceFactor(1 + App.dt * -this._zoom_speed * (e.deltaY > 1 ? -1 : 1) );
}

CameraController.prototype.orbit = function (e) {
    var delta = e.deltax > this._delta_threshold || e.deltax < -this._delta_threshold ? e.deltax : 0;
    this._obj.orbit(App.dt * delta * this._rotation_speed, [0, -1, 0]);
    this._obj.updateMatrices();
    delta = e.deltay > this._delta_threshold || e.deltay < -this._delta_threshold ? e.deltay : 0;
    var right = this._obj.getLocalVector([-1, 0, 0]);
    this._obj.orbit(App.dt * delta * this._rotation_speed, right);
}

CameraController.prototype.rotate = function (e) {
    var delta = e.deltax > this._delta_threshold || e.deltax < -this._delta_threshold ? e.deltax : 0;
    this._obj.rotate(App.dt * -delta * this._rotation_speed, [0, 1, 0], [0, 0, 0]);
    delta = e.deltay > this._delta_threshold || e.deltay < -this._delta_threshold ? e.deltay : 0;
    var right = this._obj.getLocalVector([1, 0, 0]);
    this._obj.rotate(App.dt * -delta * this._rotation_speed, right, [0, 0, 0]);

}

CameraController.prototype.move = function (e) {
    this._obj.moveLocal( [-e.deltax * App.dt, e.deltay * App.dt, 0]);
}

CameraController.prototype.handleMouseMove = function (e) {
    if (e.dragging)  {

        if(e.leftButton) {
            this.orbit(e);
        } else if(e.rightButton){
            this.rotate(e);
        } else {
            this.move(e);
        }
    }
}

CameraController.prototype.handleMouseDown = function (e) {
}

function NodeController(obj, options) {
    this._constructor(obj, options);
    this._node_temp = new RD.SceneNode();
    this._node_temp.id = "bounding";
    this._node_temp.mesh = "bounding";
    this._node_temp.primitive = gl.LINES;
    this._node_temp.color = [0.3, 0.7, 0.56];
    // TODO the attributes the ui must show
    this._ui_attributes = [
        "color",
        "position"
    ];
    this._gizmo_activated = false;
    this._gizmo = new RD.SceneNode();
    //this._gizmo.scale = [ 0.5, 0.5, 0.5];
    this._gizmo.id = "gizmo";
    var gizmoX = createGizmoAxis("gizmoX",[1, 0 ,0 ], [0, 90 * DEG2RAD, 0]);
    this._gizmo.addChild(gizmoX);
    var gizmoY = createGizmoAxis("gizmoY",[0, 1 ,0 ], [0, 0, 0]);
    this._gizmo.addChild(gizmoY);
    var gizmoZ = createGizmoAxis("gizmoZ",[0, 0 ,1 ], [0, 0, 90 * DEG2RAD]);
    this._gizmo.addChild(gizmoZ);


    function createGizmoAxis(id,position, angle_euler_in_dg){
        var axis = new RD.SceneNode();
        axis.id = id;
        axis.mesh = "cylinder";
        axis.position = position;
        axis.flags.depth_test = false;
        axis.shader = "phong";
        axis.setRotationFromEuler(angle_euler_in_dg);
        axis.color = [ 1, 1, 1];
        return axis;
    }
}
extendClass(NodeController, ObjectController);


NodeController.prototype.handleMouseWheel = function (e) {
}

NodeController.prototype.handleMouseMove = function (e) {

}

NodeController.prototype.handleMouseDown = function (e) {
    this.selectNode(e.obj)
    $(document).trigger("node_selected", e.obj );
}


NodeController.prototype.getScaleFactors = function () {
        var mesh = gl.meshes[this._obj.mesh];
        var min = BBox.getMin(mesh.bounding);
        var max = BBox.getMax(mesh.bounding);
        return [max[0]-min[0], max[1]-min[1], max[2]-min[2]];
}

NodeController.prototype.selectNode = function (node) {
    if (this._obj)
        this.removeBounding();
    this._obj = node;
    if(this._obj)
        this.createBounding();
    this.createGizmo();
}

NodeController.prototype.createBounding = function () {
    this._node_temp._scale.set(this.getScaleFactors());
    this._node_temp.updateLocalMatrix();
    this._obj.addChild(this._node_temp);
}

NodeController.prototype.createGizmo = function () {
    if(this._gizmo_activated && this._obj)
        this._obj.addChild(this._gizmo);
}

NodeController.prototype.removeBounding = function () {
    this._obj.removeChild(this._node_temp);
    if(this._gizmo_activated && this._gizmo.parentNode)
        this._obj.removeChild(this._gizmo);
}

NodeController.prototype.activateGizmo = function (e) {
    this._gizmo_activated = true;
    this.createGizmo();
}
NodeController.prototype.desactivateGizmo = function (e) {
    this._gizmo_activated = false;
    if(this._gizmo.parentNode)
        this._obj.removeChild(this._gizmo);
}

NodeController.prototype.desactivateTools = function (e) {
    this.desactivateGizmo();
}
