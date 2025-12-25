txz = txz or {}

local activeTimelineId = nil

local function _status(s)
    if s == "complete" or s == "active" or s == "pending" then return s end
    return "pending"
end

local function _color(c)
    if c == "blue" or c == "teal" then return c end
    return "teal"
end

local function _send(action, payload)
    SendNUIMessage(payload)
end

function txz.showTimeline(data)
    if type(data) ~= "table" then return nil end
    if not data.id then return nil end
    if type(data.tasks) ~= "table" then return nil end

    local tl = {
        id = tostring(data.id),
        title = tostring(data.title or "Timeline"),
        description = tostring(data.description or ""),
        icon = tostring(data.icon or "fa-brands fa-discord"),
        tasks = {}
    }

    for i = 1, #data.tasks do
        local t = data.tasks[i]
        if type(t) == "table" and t.id then
            tl.tasks[#tl.tasks + 1] = {
                id = tostring(t.id),
                title = tostring(t.title or ""),
                description = tostring(t.description or ""),
                status = _status(t.status),
                color = _color(t.color)
            }
        end
    end

    activeTimelineId = tl.id
    _send("timeline:show", { action = "timeline:show", timeline = tl })
    return tl.id
end

function txz.hideTimeline(id)
    local tid = id and tostring(id) or activeTimelineId
    if not tid then return end
    if activeTimelineId == tid then activeTimelineId = nil end
    _send("timeline:hide", { action = "timeline:hide", id = tid })
end

function txz.updateTimeline(timelineId, updates)
    if not timelineId then return end
    if type(updates) ~= "table" then return end
    _send("timeline:update", { action = "timeline:update", id = tostring(timelineId), updates = updates })
end

function txz.addTimelineTask(timelineId, task)
    if not timelineId then return end
    if type(task) ~= "table" then return end
    if not task.id then return end

    task.status = _status(task.status)
    task.color = _color(task.color)

    _send("timeline:tasks:add", {
        action = "timeline:tasks:add",
        timelineId = tostring(timelineId),
        task = {
            id = tostring(task.id),
            title = task.title and tostring(task.title) or "",
            description = task.description and tostring(task.description) or "",
            status = task.status,
            color = task.color
        }
    })
end

function txz.updateTimelineTask(timelineId, taskData, status)
    if not timelineId then return end

    if type(taskData) == "string" or type(taskData) == "number" then
        _send("timeline:tasks:update", {
            action = "timeline:tasks:update",
            timelineId = tostring(timelineId),
            tasks = {
                id = tostring(taskData),
                status = _status(status)
            }
        })
        return
    end

    if type(taskData) == "table" then
        if taskData.id then
            _send("timeline:tasks:update", {
                action = "timeline:tasks:update",
                timelineId = tostring(timelineId),
                tasks = {
                    id = tostring(taskData.id),
                    title = taskData.title and tostring(taskData.title) or nil,
                    description = taskData.description and tostring(taskData.description) or nil,
                    status = _status(taskData.status or status),
                    color = _color(taskData.color)
                }
            })
            return
        end

        local arr = {}
        for i = 1, #taskData do
            local t = taskData[i]
            if type(t) == "table" and t.id then
                arr[#arr + 1] = {
                    id = tostring(t.id),
                    title = t.title and tostring(t.title) or nil,
                    description = t.description and tostring(t.description) or nil,
                    status = _status(t.status),
                    color = _color(t.color)
                }
            end
        end

        _send("timeline:tasks:update", {
            action = "timeline:tasks:update",
            timelineId = tostring(timelineId),
            tasks = arr
        })
    end
end

function txz.getActiveTimeline()
    return activeTimelineId
end

exports("showTimeline", function(data) return txz.showTimeline(data) end)
exports("hideTimeline", function(id) return txz.hideTimeline(id) end)
exports("updateTimelineTask", function(timelineId, taskData, status) return txz.updateTimelineTask(timelineId, taskData, status) end)
exports("addTimelineTask", function(timelineId, task) return txz.addTimelineTask(timelineId, task) end)
exports("updateTimeline", function(timelineId, updates) return txz.updateTimeline(timelineId, updates) end)
exports("getActiveTimeline", function() return txz.getActiveTimeline() end)